import React, { Component } from 'react';

import AppBar from 'material-ui/AppBar';
import {Link, withRouter} from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

class Login extends Component {
  static muiName = 'FlatButton';

  render() {
    return (
      <FlatButton style={{color: 'inherit'}} label="Login"  onClick={() => this.props.logIn()}/>
    );
  }
}




class NavBar extends Component {

	render () {
		var self = this
		const Logged = withRouter(({ history }) => (
		  <IconMenu style={{color: 'inherit'}}
		    iconButtonElement={
		      <IconButton><MoreVertIcon /></IconButton>
		    }
		    targetOrigin={{horizontal: 'right', vertical: 'top'}}
		    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
		  >
		    <MenuItem primaryText="Refresh" />
		    <MenuItem primaryText="Help" />
		    <MenuItem primaryText="Sign out" 
		    	onClick={() => {				
		    	self.props.logOut()
				return (<Link replace to={{
			        pathname: '/login',
			        state: { from: this.props.location }
			      }}/>
			  )}}
		    />
		  </IconMenu>
		  )
		);
		const Login = withRouter(({ history }) => (
		  <FlatButton label="Login" onClick={() => {
		  		this.props.logIn()
				return (<Link replace to={{
			        pathname: '/login',
			        state: { from: this.props.location }
			      }}/>
			  )}}
		   />
		  )
		);
		return (
			<div >
				<AppBar title={<Link to="/" style={{color: 'inherit'}}>ArcherUX</Link>} iconElementRight={this.props.isAuthenticated ? <Logged logOut={this.props.logOut.bind(this)}/> : <Login logIn={this.props.logIn.bind(this)}/>}/>                
			</div>
		);
	};
};

export default NavBar;
