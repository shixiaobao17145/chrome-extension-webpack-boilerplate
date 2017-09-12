import React from "react";
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Toggle from 'material-ui/Toggle';
import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';
import Constant from '../constant';
let { COUNT_DOWN_SECONDS, ENABLE } = Constant.KEYS;
let defaultSettingData = {};
defaultSettingData[COUNT_DOWN_SECONDS] = Constant.DEFAULT_COUNT_DOWN_SENCONDS;
defaultSettingData[ENABLE] = Constant.DEFAULT_EXTENSION_ENABLE;
export default class Setting extends React.Component{
	constructor(props){
		super(props);
		this.state = defaultSettingData;
	}
	componentDidMount(){
		chrome.storage.local.get(defaultSettingData, (items) => {
			this.setState(items);
		});
	}
	onCountDownChange(evt, value){
		let data2save = {};
		data2save[COUNT_DOWN_SECONDS] = value;
		chrome.storage.local.set(data2save, () => {
			console.log('countDown saved');
			this.setState(data2save);
		});
	}
	onEnableChange(evt, value){
		let data2save = {};
		data2save[ENABLE] = value;
		chrome.storage.local.set(data2save, () => {
			console.log('enable saved');
			this.setState(data2save);
		});
	}
	render(){
		return (
			<div style={{width:'350px'}}>
				<AppBar title="Setting"	titleStyle={{textAlign:'center',fontSize:'22px'}} iconElementLeft={<h1></h1>}/>
				<List>
					<Divider />
					<ListItem primaryText="Enable" rightToggle={<Toggle onToggle={this.onEnableChange.bind(this)} defaultToggled={this.state[ENABLE]}/>} />
					<ListItem primaryText="CountDown Seconds" rightToggle={<TextField onChange={this.onCountDownChange.bind(this)} style={{top:0}} type="number" value={this.state[COUNT_DOWN_SECONDS]}/>}>
					</ListItem>
				</List>
			</div>
		)
	}
}
