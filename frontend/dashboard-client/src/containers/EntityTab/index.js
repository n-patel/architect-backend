import React, { Component } from 'react';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import UpArrow from 'material-ui/svg-icons/navigation/arrow-upward';

import DownArrow from 'material-ui/svg-icons/navigation/arrow-downward';

import { connect } from 'react-redux';
import EntitiesList from '../../components/Entity/'
import './style.css';

const iconStyles = {
    marginRight: 8,
    width: 16,
    height: 16,
    paddingTop: 32
}


class EntitiesTab extends Component {
	constructor(props) {
		super(props);
		this.state = {
			drawerOpen: false,
			currentEntity: null,
			entitySortBy: {property: null, reverse: false},
			queryEntity: null
		};
		this.getEntitySource = this.getEntitySource.bind(this);
		this.openEntityDrawer = this.openEntityDrawer.bind(this);
		this.closeEntityDrawer = this.closeEntityDrawer.bind(this);
		this.handleEntitySearch = this.handleEntitySearch.bind(this);
		this.handleChangeSortBy = this.handleChangeSortBy.bind(this);
		this.reverseList = this.reverseList.bind(this);
	};

	getEntitySource(entity) {
		//TODO: refactor to account for entities having multiple sources
		var sourceid = entity.sources[0];
		var source = this.props.savedSources.documents.find(function (obj) {return obj._id=== sourceid});
		if (typeof(source) !== "undefined"){
			return source.content;
		} else {
			return "";
		}
	};

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
					<Drawer width={300} containerStyle={{height: 'calc(100% - 64px)', top: 64}} openSecondary={true} open={this.state.drawerOpen} >
			          	<AppBar onLeftIconButtonTouchTap={this.closeEntityDrawer}
	    						iconElementLeft={<IconButton><NavigationClose /></IconButton>}
	    						title={'Entity Details'}
	    						 />                
			          	{this.state.drawerOpen ? this.renderEntityDrawer() : null}
			        </Drawer>
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
					        	{this.state.entitySortBy.reverse ? <UpArrow style={iconStyles}/> : <DownArrow style={iconStyles}/>}
					        </div>
					    </div>
			        	<EntitiesList entities={this.props.entities} searchTerm={this.state.queryEntity} sortBy={this.state.entitySortBy} getSource={this.getEntitySource} onEntityClick={this.openEntityDrawer}/>
			        </div>
				</div>
			);      
		}
	}
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch: dispatch,
	};
}

function mapStateToProps(state, ownProps) {
	if (state.data.savedEntities.status === 'isLoding') {
		return {
			status: state.data.savedEntities.status,
	    }
	} else {
	    return {
			status: state.data.savedEntities.status,
			savedSources: state.data.savedSources
	    }
	}
}


export default connect(mapStateToProps, mapDispatchToProps)(EntitiesTab);