import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Home from '../../pages/Home/';
import Project from '../../pages/Project/';
import NewProject from '../../pages/Project/new.js';
import Source from '../../pages/Source/';
import NavBar from '../../components/NavBar/';

import './index.css';
// Color options: 45AD7C (darker green) or 4CBF88 (lighter green)
const muiTheme = getMuiTheme({
  fontFamily: "'Open Sans', sans-serif",
	palette: {
		accent1Color: '#2c98f0',
	}
});

export default class Root extends Component {
	render() {
		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<Provider store={this.props.store}>
					<Router>
						<div>
							<NavBar />
							<Route exact path="/" component={Home} />
							<Route path="/project/:id" component={Project} />				    		
							<Route path="/source/:id" component={Source}/>
              <Route path="/newproject/:id" component={NewProject}/>
						</div>
					</Router>
				</Provider>
			</MuiThemeProvider>
		);
	};
}
