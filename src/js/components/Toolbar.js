import React from 'react';
import {
	Step,
	Stepper,
	StepLabel,
} from 'material-ui/Stepper';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

const DEFAULT_COUNT = 30;
export default class MSTToolbar extends React.Component{
	constructor(props){
		super(props);
		this.state={
			text:''
		}
		this.onStartOver = this.onStartOver.bind(this);
	}
	componentWillMount(){
		this._detectProps(this.props);
	}
	componentWillUnmount(){
		clearTimeout(this._countTimer);
	}
	_detectProps(props){
		if(props.activeStep == 2){
			let count = props.count || this.props.count || DEFAULT_COUNT;
			this.startCounting(count);
		}else if(this._countTimer){
			clearTimeout(this._countTimer);
		}
	}
	componentWillReceiveProps(nextProps){
		this._detectProps(nextProps);
	}
	onStartOver(){
		this.props.onStartOver && this.props.onStartOver();
	}
	startCounting(count){
		if(count >= 1){
			this.setState({
				text:`Count down:${count} seconds`
			});
			clearTimeout(this._countTimer);
			let nextCountFn = ()=>this.startCounting(count-1);
			this._countTimer = setTimeout(nextCountFn, 1000);
		}else{
			this.onStartOver();
		}
	}
	render(){
		let { activeStep } = this.props;
		return (
			<div className="mst-toolbar">
				<MuiThemeProvider>
					<Toolbar>
						<ToolbarGroup firstChild={true} style={{flexGrow:1}}>
							<Stepper activeStep={this.props.activeStep} style={{width:'90%'}}>
								<Step>
									<StepLabel>Select Login Provider</StepLabel>
								</Step>
								<Step>
									<StepLabel>Authorization</StepLabel>
								</Step>
								<Step>
									<StepLabel>Loged in/Registration</StepLabel>
								</Step>
							</Stepper>
						</ToolbarGroup>
						<ToolbarGroup>
							<ToolbarTitle text={this.state.text} style={{fontSize:'16px'}}/>
							<ToolbarSeparator />
							<RaisedButton label="Start Over" primary={true} onClick={this.onStartOver}/>
						</ToolbarGroup>
					</Toolbar>
				</MuiThemeProvider>
			</div>)
	}
}
