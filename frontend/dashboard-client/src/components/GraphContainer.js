import React, { Component } from 'react';
import './App.css';
import Paper from 'material-ui/Paper';

import NodeGraph from './NodeGraph.js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/';

class GraphContainer extends Component {
	render() {
		return(
			<Paper>
				<NodeGraph entities={this.props.savedEntities.entities} />
			</Paper>
		)
	}

}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch),
        dispatch: dispatch,
    };
}

function mapStateToProps(state) {
    return {
        savedEntities: state.data.savedEntities,
        entityTypes: state.data.entityTypes,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphContainer)