var multer = require('multer'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    vertex = require('../models/vertex'),
    Project = require('../models/project'),
    Connection = require('../models/connection'),
    Graph = require('../models/graph'),
    mongoose = require('mongoose'),
    request = require('request'),
    cloud = require('./cloud'),
    path = require('path'),
    mime = require('mime'),
    PDFParser = require('pdf2json');

const app = require('../app').app;
const db = require('../app').db;

const bucket_name = 'dashboard-userdocs';

const storage = multer.diskStorage({
    destination: './files/',
    filename: function(req, file, callback) {
        // TODO: Change this filename to something more unique in case of repeats
        var file_name = file.originalname;
        callback(null, file_name);
    },
});

app.use(multer({
     storage:storage
     }).single('file'));

const upload = multer({ storage: storage });

function saveDoc(text, name, entities, folder_dest) {  
    var doc = {
        _id: new mongoose.Types.ObjectId,
        content: text,
        entities: entities
    }
    var newDoc = new vertex.Document(doc);
    newDoc.save()
        .then(item => {
            console.log("Successful save 1/3");
        })
        .catch(err => {
            console.log("Unable to save to database because: " + err);
        })
        
    var source = {
        _id: new mongoose.Types.ObjectId, 
        // TODO: cloudReference: String,
        cloudReference: folder_dest,
        entities: [],
        // entities: TODO: Alice fill this in with the extracted entities as a String array
        type: "Document",
        document: doc._id, // Must be documentSchema, imageSchema, or VideoSchema
    }

    var newSource = new vertex.Source(source);
    newSource.save()
        .then(item => {
            console.log("Successful save 2/3");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database because: " + err);
        })

    var vert = {
        _id: new mongoose.Types.ObjectId,
        name: name,
        type: "Source", // Must be Source or Entity
        date_added: Date.now(),
        source: source._id
    }

    var newVert = new vertex.Vertex(vert);
    newVert.save()
        .then(item => {
            console.log("Successful save 3/3");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database because: " + err);
        })
    return vert._id
}

function saveEntity(name, type, sources, neo4jid) {  
    var entity = {
        _id: new mongoose.Types.ObjectId,
        name: name,
        type: type,
        sources: sources
    }
    var newEntity = new vertex.Entity(entity);
    newEntity.save()
        .then(item => {
            console.log("Successful save 1/2");
        })
        .catch(err => {
            console.log(err);
        })
        
    var vert = {
        _id: new mongoose.Types.ObjectId,
        name: name,
        type: "Entity", // Must be Source or Entity
        date_added: Date.now(),
        neo4j_id: neo4jid,
        entity: entity._id
    }

    var newVert = new vertex.Vertex(vert);
    newVert.save()
        .then(item => {
            console.log("Successful save 2/2");
            return newVert
        })
        .catch(err => {
            res.status(400).send("Unable to save to database because: " + err);
        })
    return newVert
}

app.post('/investigation/pdf', upload.single('file'), async (req, res) => {
    try {
        // Grabs project id from the url
        var url = req.headers.referer;
        var index = url.indexOf('sources') + 8;
        var projectid = url.substring(index);
        var name = req.file.originalname;
        let text_dest = "./files/" + name.substring(0, name.length - 4) + ".txt";
        let pdf_dest = "./files/" + name;
        let folder_dest = projectid + "/" + name;

        let pdfParser = new PDFParser(this,1);

        pdfParser.loadPDF(pdf_dest);

        pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
        pdfParser.on("pdfParser_dataReady", pdfData => {
            var text = pdfParser.getRawTextContent();
            callEntityExtractor(text, function(response) {
              var vertid = saveDoc(text, name, response.entities, folder_dest);
              db.collection('projects').update(
                  {_id : mongoose.Types.ObjectId(projectid)},
                  {$push: {sources: vertid}}
                )
              })
          })
        // pdfParser API does not allow a .catch after all this?

        cloud.uploadFile(bucket_name, pdf_dest, function(error) {
          if (error) {
            console.log("this error");
            throw error;
          }
          else {
            // This line here saves it in the cloud depending on which project you are in, will be needed when need to associate docs with users.
            //cloud.moveFile(bucket_name, name, folder_dest);
            fs.unlinkSync(pdf_dest);
          }
        });
    } catch (err) {
        res.status(400).send("Unable to save pdf because: " + err);
    };

    res.send(200).json({success: true, message: "PDF upload success"});
})

function callEntityExtractor(string, callback) {
  /* Calls the entity extractor on a string */
 var optionsEntityExtractor = {
    url: 'https://api.rosette.com/rest/v1/entities', 
    method: 'POST',
    headers: {
        'X-RosetteAPI-Key': '554b291cfc61e3f3338b9f02065bd1a5'
    },
    'Content-Type': 'application/json',
    body: JSON.stringify({'content': string})
  }
  request(optionsEntityExtractor, function(error, response, body) {
    if (!error) {
        return callback(JSON.parse(body));
    } else {
      console.log(error);
      return {entities: []};
    };
  });     
}

app.get('/investigation/source', function(req,res) {
  /* Gets a particular source */

  var sourceid = req.query.sourceid
  db.collection('vertexes').find({_id: mongoose.Types.ObjectId(sourceid)}).toArray()
    .then((vertexes) => {

      /* if the source doesn't exist, that means you should return an empty array */
      if (vertexes.length === 0) {
        res.send([])
      }
      vertexesToResponse(vertexes, "Source", function(response) {
        
        /* Only send response with all of the vertexes after we've
            processed each vertex */
        if (response.length === vertexes.length) {
          res.send(response)
        }
      })
    })
    .catch((err)=>{console.log(err)})
})

app.post('/investigation/project', function(req, res) {
    /* Creates a project */

    var project = {
        _id: new mongoose.Types.ObjectId,
        name: req.body.name,
        entities: []
        //users: // Put in a fake one
    };
    var newProject = new Project(project);
    var location = './files/' + project._id + '/';
    newProject.save()
        .then(item => {
          res.send("New project saved");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database because: " + err);
        })
});

app.get('/investigation/project', function(req, res) {
  /* Gets a project */

  var projectid = req.query.projectid
  db.collection('projects').find({_id: mongoose.Types.ObjectId(projectid)}).toArray(function(err, result) {
    res.send(result)
  })
})

app.post('/investigation/entity', function(req, res){
    var newEntity = saveEntity(req.body.name, req.body.type, req.body.sources, req.body.neo4jid)
    var entityid = newEntity._id
    
    /* Updates the project document to include this entity in its list of entities. */
    db.collection('projects').update(
      {_id : mongoose.Types.ObjectId(req.body.project)},
      {$push: {entities: entityid}}
    )
    .then(data => {
      console.log("Updated project 1/1.")
      res.send("Sucessful adding of entity")
    })
    .catch((err) => {console.log(err)});
})

app.delete('/investigation/entity', function(req, res) {
  /* Deletes an entity from a project */

  var entityid = mongoose.Types.ObjectId(req.query.entityid);
  db.collection('vertexes').find({_id: entityid}).toArray()
    .then((vertex) => {
      return db.collection('entities').remove({_id: vertex[0].entity})
        .then((data) => {
          console.log("Removed 1/2")
          return db.collection('vertexes').remove({_id: entityid})
          .then((data) => {
            console.log("Removed 2/2")
            return db.collection('projects').update(
              {_id : mongoose.Types.ObjectId(req.body.projectid)},
              {$pull: {entities: entityid}}                                     
            )
            .then(data => {
              console.log("Updated project entities.")
              res.send("Finished deleting entity.")
            })
            .catch((err) => {console.log(err)});           
          })
          .catch((err) => {console.log(err)});

        })
        .catch((err) => {console.log(err)});
    })
    .catch((err) => {console.log(err)});
})

app.delete('/investigation/suggestedEntity', function(req, res) {
  /* Deletes the suggested entity that's attached to a source. */

  var sourceid = mongoose.Types.ObjectId(req.query.sourceid);
  db.collection('vertexes').find({_id: sourceid}).toArray()
    .then((vertex) => {
        return db.collection('sources').find({_id: vertex[0].source}).toArray()
        .then((source) => {
          return db.collection('documents').update(
            {_id: source[0].source},
            {$pull: {entities: {normalized: req.query.name}}}                                     
          )
          .then(data => {
            res.send("Deleted 1/1.")
          })
          .catch((err) => {console.log(err)})
        })
        .catch((err) => {console.log(err)})
    })
})

app.post('/investigation/connection', function(req, res){
  var connection = {
    _id: new mongoose.Types.ObjectId,
    description: req.body.description,
    vertices: [req.body.idOne, req.body.idTwo],
    confidence: 1 //TODO: decide how we want to deal with confidence level of connections
  };
  var newConnection = new Connection(connection);
  newConnection.save()
    .then(item => {
      console.log("Saved connection 1/1.")
      db.collection('vertexes').update(
          {_id: mongoose.Types.ObjectId(req.body.idOne)},
          {$pull: {connections: connection._id}}
        ).then((data) => { 
          console.log("Updated entity 1/2.")
          db.collection('vertexes').update(
            {_id: mongoose.Types.ObjectId(req.body.idTwo)},
            {$pull: {connections: connection._id}}
            ).then((data) => {
              console.log("Updated entity 2/2.")
              db.collection('projects').update(
                {_id: mongoose.Types.ObjectId(req.body.projectid)},
                {$push: {connections: connection._id}}
              )
              .then((data) => {
                console.log("Updated project 1/1.");
                res.send("New connection saved");
              }).catch(err => {console.log(err)})
          }).catch(err => {console.log(err)})
        }).catch(err =>{console.log(err)})
    }).catch(err => {
      res.status(400).send("Unable to save to database because: " + err);
    })
})

app.post('/investigation/project/graph', function(req, res){
  /* creates a new graph object, also updates the project to include a reference to the graph
   graphs contain entities, sources, and connections */

  var graph = {
    _id: new mongoose.Types.ObjectId,
    entities: req.body.entities,
    sources: req.body.sources,
    connections: req.body.connections //TODO: decide how we want to deal with confidence level of connections
  };
  var newGraph = new Graph(graph);
  newGraph.save()
    .then(item => {
      console.log("Saved graph 1/1.")
      db.collection('projects').update(
          {_id: mongoose.Types.ObjectId(req.body.projectid)},
          {$push: {graphs: graph._id}}
        ).then((data) => { 
          console.log("Updated project 1/1.")
          res.send("New graph created.")
        }).catch(err =>{console.log(err)})
    }).catch(err => {
      res.status(400).send("Unable to save to database because: " + err);
    })
})

function vertexesToResponse(vertexes, type, callback) {
  /* Takes in a set of vertexes in array format and gathers the 
    relevant information to add to the vertex in order to use the 
    callback function on the resulting array */

  var updatedVertexes = [];
  if (type === "Source") {
    vertexes = vertexes.map((vertex) => {
      return db.collection('sources').find({_id: vertex.source}).toArray()
        .then((sources) => {
          return db.collection('documents').find({_id: sources[0].document}).toArray()
          .then((document) => {
            vertex.source = sources[0];
            vertex.source.document = document[0];
            updatedVertexes.push(vertex);
            return callback(updatedVertexes);
          })
          .catch((err)=> {console.log(err)});
        })
        .catch((err)=> {console.log(err)});
    })
  }
  if (type === "Entity") {
    vertexes = vertexes.map((vertex) => {
      return db.collection('entities').find({_id: vertex.entity}).toArray()
        .then((entities) => {
          vertex.entity = entities[0];
          updatedVertexes.push(vertex);
          return callback(updatedVertexes);
        })
        .catch((err)=> {console.log(err)});
    }); 
  };
}

app.post('/investigation/project/entityExtractor', function(req, res) {
  /* Submits a string that is saved as a source and calls the entity 
      extractor on it */

  callEntityExtractor(req.body.text, function(response) {
    var vertid = saveDoc(req.body.text, req.body.title, response.entities, "")
    db.collection('projects').update(
      {_id : mongoose.Types.ObjectId(req.body.project)},
      {$push: {sources: vertid}}
    )
    .then((data) => {res.send(200)})
    .catch((err)=> {console.log(err)});
  })
})

app.get('/investigation/project/entities', function(req, res) {
  /* Gets all the entities from a project */

  var projectid = mongoose.Types.ObjectId(req.query.projectid)
  db.collection('projects').find({_id: mongoose.Types.ObjectId(projectid)}).toArray()
    .then((projects) => {
      db.collection('vertexes').find({_id: {$in: projects[0].entities}, type: "Entity"}).toArray()
        .then((vertexes) => {
          if (vertexes.length === 0) {
            res.send([])
          }
          vertexesToResponse(vertexes, "Entity", function(response) {
            if (response.length === vertexes.length) {
              res.send(response)
            }
          })
        })
        .catch((err)=>{console.log(err)})    
    })
    .catch((err)=>{console.log(err)})    
})

/* Downloads document from cloud and sends to frontend TODO: angelina, this does not yet work correctly*/
app.get('/investigation/project/document', function(req, res) {
  console.log("DOWNLOADING");
  //cloud.listFiles(bucket_name);
  //var projectid = req.query.projectid;
  var file_name = req.query.file_name;
  var cloud_loc = '/' + file_name;
  var dest_file = './files/' + file_name;
  console.log(cloud_loc);
  // Maybe check if it's already there and if so don't download?

  cloud.downloadFile(bucket_name, cloud_loc, dest_file, function (error) {
    if (error) {
      throw error;
    }
    else {
      console.log("read_file");
      fs.readFile(dest_file, (err, data) => {
        res.header('content-type', 'application/pdf');
        res.send(data);
      });


    //   var file = __dirname + '/upload-folder/dramaticpenguin.MOV';

    //   var filename = path.basename(file);
    //   var mimetype = mime.lookup(file);

    //   res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    //   res.setHeader('Content-type', mimetype);

    //   var filestream = fs.createReadStream(file);
    //   filestream.pipe(res);
    // });file);
    //   filestream.pipe(res);



    }
  })
})


app.get('/investigation/project/sources', function(req, res) {
  /* Gets all the sources from a project */

  var projectid = req.query.projectid
  db.collection('projects').find({_id: mongoose.Types.ObjectId(projectid)}).toArray()
  .then((projects) => {
    db.collection('vertexes').find({_id: {$in: projects[0].sources}, type: "Source"}).toArray()
    .then((vertexes) => {

      /* if the project's array of sources doesn't exist, return an empty array */
      if (vertexes.length === 0) {
        console.log("empty sources");
        res.send([]);
      }
      vertexesToResponse(vertexes, "Source", function(response) {
        if (response.length === vertexes.length) {
          res.send(response);
        };
      });
    });
  });
});

 app.get('/investigation/projectList', function(req, res) {
    /* Gets all the projects */
      db.collection('projects').find({}).toArray(function(err, result) {
        if (err) throw err;
       res.send(result);
     });
  });

app.get('/investigation/vertexList', function(req, res) {
    // gets all vertexes associated with a project

    var projectid = mongoose.Types.ObjectId(req.query.projectid)
    db.collection('projects').find({_id: mongoose.Types.ObjectId(projectid)}).toArray()
    .then((projects) => {
      var vertexes = projects[0].entities.concat(projects[0].sources)
      db.collection('vertexes').find({_id: {$in: vertexes}}).toArray()
        .then((vertexes) => {
          if (vertexes.length === 0) {
            res.send([])
          } else {
            res.send(vertexes)
          }
        })
        .catch((err)=>{console.log(err)})    
    })
    .catch((err)=>{console.log(err)})    
});

app.get('/investigation/connectionList', function(req, res) {
    // Gets all connections associated with a project

    var projectid = mongoose.Types.ObjectId(req.query.projectid)
    db.collection('projects').find({_id: mongoose.Types.ObjectId(projectid)}).toArray()
    .then((projects) => {
      db.collection('connections').find({_id: {$in: projects[0].connections}}).toArray()
        .then((connections) => {
          if (connections.length === 0) {
            res.send([])
          } else{
            res.send(connections)
          }
        })
        .catch((err)=>{console.log(err)})    
    })
    .catch((err)=>{console.log(err)}) 
});

app.get('/investigation/searchSources', function(req, res) {
    var phrase = req.query.phrase;
    vertex.Vertex.find({
        type: 'Source',
    })
    .populate({
        path: 'source',
        populate: {
            path: 'source',
            model: 'Document'
        }
    })
    .exec(function (err, vertices) {
        var found = [];
        if (err) return console.error(err);
        for (var i = 0; i < vertices.length; i++) {
            if (vertices[i].source.source.content && vertices[i].source.source.content.search(phrase) != -1) {
                found = found.concat(vertices[i].name)
            }
        }
        res.send(found);
    })
});
