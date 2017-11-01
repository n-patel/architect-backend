import React, { Component } from 'react';

import './style.css'

import EntitiesTab from '../../containers/EntityTab';
import EntityExtractor from '../../components/EntityExtractor/';
import NodeGraph from '../../components/NodeGraph';
import SourcesTab from '../../containers/SourcesTab';
import PDFUploader from '../../components/PDFUploader';
import AddEntity from '../../components/Entity/AddEntity';

import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import NotificationsIcon from 'material-ui/svg-icons/social/notifications';
import Paper from 'material-ui/Paper';
import {Tabs, Tab} from 'material-ui/Tabs';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../redux/actions/';
import * as server from '../../server/';

const tab_style = {
	backgroundColor: '#fafafa',
	color:'#747474'
};

class ProjectPage extends Component {
	componentDidMount = () => {
    this.props.actions.getProject(this.props.match.params.id);
    this.props.actions.getProjectEntities(this.props.match.params.id);
    this.props.actions.getProjectSources(this.props.match.params.id);
	};

	render() {
    if (this.props.status === 'isLoading') {
      return (<div className="projects">
            <p> Loading ... </p>
          </div>
        );
    } else {
      return (
  			<div>
  				<div className="header">
  					<div className="header-text">
  						<h3>{this.props.currentProject.name}</h3>
  					</div>
  					<div id="notifications">
  						<Badge
  						  badgeContent={10}
  						  secondary={true}
  						  badgeStyle={{top: 12, right: 12}}
  						>
  						  <IconButton tooltip="Notifications">
  							<NotificationsIcon />
  						  </IconButton>
  						</Badge>
  					</div>
  				</div>
  				<div className="tabs" style={{width:'100%', margin:'0 auto'}}>
  					<Tabs >
  						<Tab label="Workspace" type="default" style={tab_style}>
  							<div className="graph-canvas">
  								<Paper style={{width:"80%", margin:"0px auto", display:"flex"}}>
  									<NodeGraph entities={this.props.savedEntities.entities} sources={[]}/>
  								</Paper>
                  <Paper style={{position: "absolute"}}>
                    <div className="text-container">
                      <EntityExtractor projectid={this.props.match.params.id}/>
                    </div>
                    <AddEntity sourceid={0} projectid={this.props.match.params.id}/>
                  </Paper>
  							</div>
  						</Tab>
  						<Tab label={"Entities (" + this.props.savedEntities.entities.length + ")"} style={tab_style}>
  							<div className="column">
  								<Paper className="projects">
  									<EntitiesTab entities={this.props.savedEntities.entities}/>
  								</Paper>
  							</div>
  						</Tab>
  						<Tab label="Sources" style={tab_style}>
  							<div className="column">
  								<PDFUploader />
  								<Paper className="projects">
  									<SourcesTab />
  								</Paper>
  							</div>
  						</Tab>
  					</Tabs>
  				</div>
  			</div>
      );
    };
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
		dispatch: dispatch,
	};
}

function mapStateToProps(state, props) {
  if (state.data.savedEntities.status === 'isLoading' || state.data.savedSources.status === 'isLoading') {
    return {
      status: 'isLoading',
    }
  } else {
    return {
      status: 'isLoaded',
      savedEntities: state.data.savedEntities,
      projects: state.data.projects,
      savedSources: state.data.savedSources,
      currentProject: state.data.currentProject
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectPage);
