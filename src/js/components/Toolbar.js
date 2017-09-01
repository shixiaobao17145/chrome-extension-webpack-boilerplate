import React from 'react';
import {
	Step,
	Stepper,
	StepLabel,
} from 'material-ui/Stepper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
export default class Toolbar extends React.Component{
	render(){
		return (
			<div className="mst-toolbar">
				<MuiThemeProvider>
					<Stepper activeStep={2}>
						<Step>
							<StepLabel>Select campaign settings</StepLabel>
						</Step>
						<Step>
							<StepLabel>Create an ad group</StepLabel>
						</Step>
						<Step>
							<StepLabel>Create an ad</StepLabel>
						</Step>
					</Stepper>
				</MuiThemeProvider> 
			</div>)
	}
}
