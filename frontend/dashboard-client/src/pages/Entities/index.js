import React, { Component } from 'react'; 

import TextField from 'material-ui/TextField';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import UpArrow from 'material-ui/svg-icons/navigation/arrow-upward';
import { withRouter } from 'react-router-dom';

import DownArrow from 'material-ui/svg-icons/navigation/arrow-downward';

import EntityTable from './components/EntityTable'

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../redux/actions/';
import './style.css';

const iconStyles = {
    marginRight: 8,
    width: 16,
    height: 16,
    paddingTop: 32
}


class Entities extends Component {
	constructor(props) {
		super(props);
		this.state = {
			drawerOpen: false,
			currentEntity: null,
			entitySortBy: {property: null, reverse: false},
			queryEntity: null
		};
	    //this.createEntity = this.createEntity.bind(this);
	    this.deleteEntity = this.deleteEntity.bind(this);
		this.getEntitySource = this.getEntitySource.bind(this);
		this.openEntityDrawer = this.openEntityDrawer.bind(this);
		this.closeEntityDrawer = this.closeEntityDrawer.bind(this);
		this.handleEntitySearch = this.handleEntitySearch.bind(this);
		this.handleChangeSortBy = this.handleChangeSortBy.bind(this);
		this.reverseList = this.reverseList.bind(this);
	};

	componentDidMount = () => {
	    this.props.actions.fetchProjectEntities(this.props.match.params.id);
      this.props.actions.fetchProject(this.props.match.params.id);
	};

	componentWillReceiveProps = (newprops) => {
		if (this.props.projectid != newprops.projectid) {
			this.props.actions.fetchProjectEntities(newprops.projectid);
      this.props.actions.fetchProject(newprops.projectid);
		}
	}

	/*createEntity(suggestedEntity) {
	    var entity = {
	      name: suggestedEntity.name,
	      type: suggestedEntity.type.toLowerCase(),
	      sources: suggestedEntity.sources,
	      projectid: this.props.projectid,
	      tags: []
	    }
	    this.props.actions.createEntity(entity);
	    this.props.actions.deleteSuggestedEntity(suggestedEntity, suggestedEntity.sources[0]);
	  }*/

  deleteEntity(entity, listType) {
    /*if (this.props.listType === "suggested_entities") {
      this.props.actions.deleteSuggestedEntity(entity, entity.sources[0])
    }*/
    if (listType === "entities") {
      this.props.actions.deleteEntity(entity, this.props.projectid)
    }
  }

  getEntitySource(vertex) {
		//TODO: refactor to account for entities having multiple sources
    var sourceid = vertex.entity.sources[0];
		var source = this.props.savedSources.documents.find(function (obj) {return obj._id=== sourceid});
		if (typeof(source) !== "undefined"){
			return source.content;
		} else {
			return;
		}
	}

	//called from entity with this.props.onEntityClick(entity)
	openEntityDrawer = (entity) => {
		this.setState({drawerOpen: true, currentEntity: entity});
	}

	closeEntityDrawer = () => {
		this.setState({drawerOpen: false, currentEntity: null});
	}

	renderEntityDrawer() {
		return (
			<div style={{textAlign: 'left', paddingLeft: '10px'}}>
				<div>
          <p></p>
					<b>Name: {this.state.currentEntity.name}</b>
					<p>Type: {this.state.currentEntity.type}</p>
					<p>Link: {this.state.currentEntity.link}</p>
					<p>Chips: {this.state.currentEntity.chips}</p>
					<p>Sources: {this.state.currentEntity.sources}</p>
					<p>Qid: {this.state.currentEntity.qid}</p>
				</div>
				<div>
					<br />
          <b>Source:</b>
					<p>{this.getEntitySource(this.state.currentEntity)}</p>
				</div>
				<TextField
			      hintText="Add notes"
			      multiLine={true}
			      rows={1}
			    /><br />
			</div>
		);
	}


	handleEntitySearch(event, value) {
		this.setState({
			queryEntity: value
		});
	};

	handleChangeSortBy(event, index, value) {
		this.setState({
			entitySortBy: {property: value, reverse: this.state.entitySortBy.reverse},
		})
	}

	reverseList() {
		this.setState({
			entitySortBy: {property: this.state.entitySortBy.property, reverse: !this.state.entitySortBy.reverse},
		})
	}

	render() {
		if (this.props.status === 'isLoading') {
    		return (<div className="projects">
    					<p> Loading ... </p>
    				</div>
    			);
    	} else {
			return(
				<div>
            <div className = "projectHeading">
				      {"Projects > " + this.props.project.name + " > Entities"}
            </div>
						{/* TEMPORARILY DEPRECATED 02/22/2018 IN ENTITIES PAGE PR

            <Drawer width={300} containerStyle={{height: 'calc(100% - 64px)', top: 64}} openSecondary={true} open={this.state.drawerOpen} >
		          	<AppBar onLeftIconButtonTouchTap={this.closeEntityDrawer}
    						iconElementLeft={<IconButton><NavigationClose /></IconButton>}
    						title={'Entity Details'}
    						 />                
		          	{this.state.drawerOpen ? this.renderEntityDrawer() : null}
		        </Drawer>
          */}
				        <div>
				        	<div className="entitiesListHeader">
					        	<TextField
									floatingLabelText="Search for entity name"
									hintText="e.g. Person"
									onChange={this.handleEntitySearch}
									style={{marginRight: 16, marginLeft: 24}}
									fullWidth={true}
								/>
								<SelectField
						        	floatingLabelText="Sort By"
						        	value={this.state.entitySortBy.property}
						        	onChange={this.handleChangeSortBy}
						        	style={{textAlign: 'left', marginRight: 8}}
						        	autoWidth={true}
						        >
									<MenuItem value={'name'} primaryText="Name" />
									<MenuItem value={'type'} primaryText="Type" />
									<MenuItem value={'source'} primaryText="Source" />
									<MenuItem value={'dateAdded'} primaryText="Date Added" />
						        </SelectField>
						        <div onClick={this.reverseList}>
						        	{this.state.entitySortBy.reverse ? <UpArrow className="icon" style={iconStyles}/> : <DownArrow className="icon" style={iconStyles}/>}
						        </div>
						    </div>
                <div className="container">
                  <EntityTable
                    entities={this.props.entities} 
                    searchTerm={this.state.queryEntity} 
                    sortBy={this.state.entitySortBy} 
                    getSource={this.getEntitySource} 
                    onCreateEntity={this.createEntity}
                    onDeleteEntity={this.deleteEntity}
                  />
                </div>
				      </div>
				</div>
			);      
		}
	}
}

function mapDispatchToProps(dispatch) {
	return {
    actions: bindActionCreators(actions, dispatch),
		dispatch: dispatch,
	};
}

function mapStateToProps(state, ownprops) {
	if (state.data.savedEntities.status === 'isLoading') {
		return {
			status: state.data.savedEntities.status,
	    }
	} else {
	    return {
	    	projectid: ownprops.match.params.id,
        project: state.data.currentProject,
	    	entities: state.data.savedEntities.entities,
			status: state.data.savedEntities.status,
			savedSources: state.data.savedSources
	    }
	}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Entities));