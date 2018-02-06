var express = require('express'),
    session = require('express-session'),
    app = express(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    User = require('./models/user'),
    MongoStore = require('connect-mongo')(session),
    users_controller = require('./controllers/users'),
    configData = require('./config.js'),
    multer = require('multer'),
    path = require('path'),
    util = require('util'),
    fs = require('fs'),
    PDFParser = require("pdf2json");

mongoose.Promise = Promise;
mongoose.connect(configData.db_url, configData.db_options);
// mongoose.connect('mongodb://alice:archer@ds143245.mlab.com:43245/uxreceiverdev');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = {
    app,
    db
};

var port = process.env.PORT || 8000;
app.set('port', port);
app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//////////// Setting Headers (CORS) ////////////
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Content-Type, Accept, Origin');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});
////////////////////////////////////////////////


const sessionOptions = {
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: configData.express_session_secret,
    proxy: false,
    name: "sessionId",
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 10080000, // 1000*60*60*24*7 // Note persistent vs session cookies
        expires: new Date(new Date().getTime() + (1000*60*60*24*7)) // 7 days
    },
    store: new MongoStore({
        url: configData.db_url,
        autoReconnect: true
    })
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.authenticate()); // TODO: use this or self-defined one?


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use('/investigation', require('./controllers/investigation'));


//////////// USERS_CONTROLLER ROUTES ////////////
app.post('/api/login', users_controller.login);
app.get('/api/logout', users_controller.logout);
app.post('/api/register', users_controller.register);
app.get('/api/checkauth', users_controller.isAuthenticated, users_controller.checkAuth);
// app.get('/api/checkauth', passport.authenticate, users_controller.checkAuth);
/////////////////////////////////////////////////


app.get('*', function(req, res) {
    res.status(404).send('Not found');
});
