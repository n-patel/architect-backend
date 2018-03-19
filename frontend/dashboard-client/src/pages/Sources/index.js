import React, { Component } from 'react';

import PDFUploader from '../../components/PDFUploader';
import SourcesTab from './SourcesTab';
import Paper from 'material-ui/Paper';

class Sources extends Component {

	render() {
		return (
			<div>
				<PDFUploader projectid={this.props.match.params.id}/>
				<SourcesTab projectid={this.props.match.params.id}/>
			</div>)		
	};
}


export default Sources;


