import React, { Component } from 'react';

import './style.css'

import EntityCard from './components/EntityCard/';
import SummaryInfo from './components/SummaryInfo/';
import ConnectionsTab from './components/ConnectionsTab/';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../redux/actions/';
import * as server from '../../server/';

class Entity extends Component {

  constructor(props){
    super(props);
    this.state ={
      nodeData: null,
      relationshipData: null
    }
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount = () => {
    this.loadData(this.props.match.params.neo4j_id)
  }

  componentWillReceiveProps = (nextprops) => {
    this.loadData(nextprops.match.params.neo4j_id)
  }

  loadData(neo4j_id) {
    server.getBackendNode(neo4j_id)
      .then(data => {
        this.setState({nodeData: data[0]})
      })
      .catch(err => {
        console.log(err)
      })
    server.getNodeRelationships(neo4j_id)
      .then(data => {
        this.setState({relationshipData: data})
      })
      .catch(err => {
        console.log(err)
      })
  }

  render(){
    if (this.state.nodeData== null || this.state.relationshipData==null) {
      return (
        <div>Loading</div>
      );
    } else {
      return(
        <div className="entityInfo">
          <EntityCard nodeItem={this.state.nodeData[0]} />
          <SummaryInfo nodeItem={this.state.nodeData[0]} nodeRelationships={this.state.relationshipData}/>
          <ConnectionsTab nodeRelationships={this.state.relationshipData}/>
        </div>
      );
    }
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
    dispatch: dispatch,
  }
}

function mapStateToProps(state, props) {
  return{
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Entity);