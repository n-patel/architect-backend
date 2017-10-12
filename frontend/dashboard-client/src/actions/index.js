import { ADD_LINK, USER_LOGOUT, ADD_ENTITY, ADD_TAG} from '../constants/actionTypes';


export function addLink(link) {
	return {
		type: ADD_LINK,
		payload: link
	}
}

export function addEntity(entity) {
	return {
		type: ADD_ENTITY,
		payload: entity
	}
}

export function addTag(entities, name, tag) {
	let entity = entities.find(x => x.name === name)
	const index = entities.indexOf(entity)
	entities[index] = Object.assign({}, entities[index])
	entities[index].chips = entities[index].chips.concat([tag])	
	return {
		type: ADD_TAG,
		payload: entities
	}
}

export function retrieveDetails(actionType, res) {
	return {
		type: actionType,
		payload: res
	};
}

// export function fetchData(endpoint, actionType) {
// 	return function (dispatch, getState) {
// 		return server[endpoint]()
// 			.then(response => {
// 				dispatch(retrieveDetails(actionType, response));
// 			})
// 			.catch(err => {
// 				console.log(err)
// 			})
// 	}
// }

export function logOutUser() {
	return {
		type: USER_LOGOUT,
	}
}

export function apiCall(string) {
	var apiResponse = /* MAKE API CALL*/
	console.log(apiResponse)
	// make sure you're getting what you want. You should have an issue with promises..
} 