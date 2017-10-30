import React, {Component} from 'react';
import { Provider } from 'react-redux';
import './index.css';
import Home from '../components/Home';
import App from '../components/App';
import SaveLinks from '../components/saveLinks';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Redirect} from 'react-router'; //ADDED THIS FOR AUTH ATTEMPT
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import CreateAccount from '../components/createAccount';
import LoginPage from '../components/loginPage';
import {isAuthedBool, isAuthenticated} from "../server/transport-layer";
import {TestPage} from "../components/testPage";

// const requireAuth = (nextState, replace, callback) => {
//     // // const { user: { authenticated } } = store.getState();
//     // if (!authenticated) {
//     //     // Takes a Location object
//     //     // https://github.com/mjackson/history/blob/master/docs/Location.md
//     //     replace({
//     //         pathname: "/login",
//     //         state: { nextPathname: nextState.location.pathname }
//     //     })
//     // }
//     // callback()
//
// };
// note onEnter, browserHistory do not exist in RR4.


// const DecisionRoute = ({ trueComponent, falseComponent, decisionFunc, ...rest }) => {
//     return (
//         <Route
//             {...rest}
//
//             render={
//                 decisionFunc()
//                     ? trueComponent
//                     : falseComponent
//             }
//         />
//     )
// };
//
const DecisionRoute = ({ trueComponent, decisionFunc, ...rest }) => {
    console.log(trueComponent); // think may be async probs
    decisionFunc().then(function(response) { // should i be returning this too??? but not async then
        return (
            <Route
                {...rest}
                render={
                    response
                        ? trueComponent
                        : redirectLogin // vs LoginPage
                }
                />
        )
    });
    // return (
    //     <Route
    //         {...rest}
    //         render={
    //             decisionFunc().then(function(response) {
    //                 if (response) {
    //                     return trueComponent;
    //                 }
    //                 return redirectLogin;
    //             })
    //              // decisionFunc()
    //              //     ? trueComponent
    //              //     : redirectLogin
    //          }
    //     />
    // )
};


const redirectCreateAccount = props => <Redirect to={'/createaccount'} />;
const redirectLogin = props => <Redirect to={'/login'} />;


export default class Root extends Component {
    render() {
		return (
			<MuiThemeProvider>
				<Provider store={this.props.store}>
				    <Router>
				    	<div>
				    		<App/>
				    		<Route exact path="/" component={Home} />
				    		{/*<Route exact path="/" render={() => (*/}
                            {/*isAuthenticated().success ? (*/}
                                {/*<Redirect to="/links" />*/}
                            {/*) : (*/}
                                {/*<Home />*/}
                            {/*)*/}
                            {/*)}/>*/}

				    		<div className="Body">
                                <Route exact path="/createaccount" component={CreateAccount} />
                                <Route exact path="/login" component={LoginPage} />
                                <Route exact path="/testpage" component={TestPage} />

                                {/*<Route component={EnsureLoggedInContainer} >*/}
                                    <Route path="/links" component={SaveLinks} />
                                {/*</Route>*/}
                                <DecisionRoute path="/links" exact={true}
                                               trueComponent={redirectCreateAccount}
                                               decisionFunc={isAuthenticated} // ()=>isAuthedBool
                                />
							</div>
						</div>
					</Router>
				</Provider>
			</MuiThemeProvider>
		);
	}
}
