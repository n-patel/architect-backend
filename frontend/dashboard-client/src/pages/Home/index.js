import React, { Component } from 'react';
import DatabaseSearchBar from '../../components/SearchBar/databaseSearchBar'

import './style.css';
class Home extends Component {

  render() {
    return (
        <div className='home-container' style={{height:'100%'}}>
          <h1 className="home-header">ARCHITECT</h1>
          <p className="home-subheader">A World of Data at your Fingertips</p>
          <div className="search-main">
            <DatabaseSearchBar/>
          </div>
        </div>
    );
  }
}

export default Home;
