console.log('this is from content script');
import Constant from './constant';
import React from 'react';
import ReactDOM from 'react-dom';
import Toolbar from './components/Toolbar';
import '../css/content.css';

let EVT_DISABLE_EXTENSTION = Constant.EVENT_TYPES.DISABLE_EXTENSTION;

function addIdentity(){
	document.documentElement.setAttribute(Constant.MST_EXTENSION_ATTR_ID, true);
}
function removeIdentity(){
	document.documentElement.setAttribute(Constant.MST_EXTENSION_ATTR_ID, false);
}

let isToolbarRendered = false;
function loadWhenReady(fn){
	let args = Array.prototype.slice.call(arguments, 1);
	console.log('=> load me!');
	if(document.readyState != 'complete'){
		console.log('1',document.readyState);

		let did = false;
		let doItIf = (state)=>{
			if(state == 'interactive' || state == 'complete'){
				console.log('3', state);
				fn.apply(this, args);
				did = true;
			}
		}

		doItIf(document.readyState);

		let readystatechangeFn = function(evt){
			console.log('2');
			doItIf(evt.target.readyState);
		};
		
		!did && document.addEventListener('readystatechange',readystatechangeFn, false);

		window.addEventListener(EVT_DISABLE_EXTENSTION, function lsn(){
			document.removeEventListener("readystatechange", readystatechangeFn, false);

			window.removeEventListener(EVT_DISABLE_EXTENSTION, lsn, false);
		}, false);
	}else{
		fn.apply(this, args);
	}
}

const TOOLBAR_ID = 'cl-mst-toolbar';
function showToolBar(opts = {}, isUnique){
	if(isUnique && isToolbarRendered){
		console.log('already reader toolbar');
		return;
	}
	let d, id = TOOLBAR_ID;
	d = document.getElementById(id);
	if(!d){
		d = document.createElement('div');
		d.id = id;
		document.body.appendChild(d);
	}

	ReactDOM.render(<Toolbar {...opts}/>, d);
	isToolbarRendered = true;
}
function removeToolBar(){
	let toolbar = document.getElementById(TOOLBAR_ID);
	toolbar && ReactDOM.unmountComponentAtNode(toolbar);
}

function onMessage(event) {

	// We only accept messages from ourselves
	if (event.source != window)
		return;

	let { data = {} } = event;
	//all the message sent should have the right 'from'
	if (data.from == Constant.MSG_FROM.DEVNET) {
		console.log("Content script received: ", event.data);
		//Delete provider's cooke
		if(data.action == Constant.ACTION_TYPES.DELETE_COOKIE
			//for compatiable with the old version of this extension
		   || data.action == Constant.ACTION_TYPES.DELETE){
			chrome.runtime.sendMessage({data:event.data}, function(response) {
				console.log(response);
			});
			//show toolbar
		}else if(data.action == Constant.ACTION_TYPES.SHOW_TOOLBAR){
			let opts = event.data.params || {activeStep:0};
			//start over function
			opts.onStartOver = function(){
				loadWhenReady(removeToolBar);
				window.postMessage({'from':Constant.MST_EXTENSION_NAME, action:Constant.ACTION_TYPES.START_OVER}, '*');
				if(document.getElementById('cl-rt-app-container')){
					window.location.reload();
				}else if(location.pathname.indexOf('.ping') == location.pathname.length-'.ping'.length){
					window.history.go(-3);
				}else{
					window.history.back();
				}
			}
			loadWhenReady(showToolBar, opts);
		}else if(data.action == Constant.ACTION_TYPES.REMOVE_TOOLBAR){
			loadWhenReady(removeToolBar);
		}
	}

}

function bootstrap(){

	addIdentity();

	window.addEventListener("message", onMessage, false);

	window.addEventListener(EVT_DISABLE_EXTENSTION, function lsn(){
		window.removeEventListener("message", onMessage, false);
		window.removeEventListener(EVT_DISABLE_EXTENSTION, lsn, false)
	}, false);

	//show toolbar by default
	//window.postMessage({action:Constant.ACTION_TYPES.SHOW_TOOLBAR},"*");

	let isInProviderPage = false;
	let loc = window.location;
	if(loc.hostname == 'github.com' && loc.pathname == 'login'){
		let decodeUrl = decodeURIComponent(decodeURIComponent(location.search));
		let urlReg = /redirect_uri=https:\/\/auth-devnet(-stg)?\.cisco\.com/;
		if(decodeUrl.indexOf('return_to=/login/oauth/authorize')>-1 && urlReg.test(decodeUrl)){
			isInProviderPage = true;
		}
	}else if(loc.hostname == 'accounts.google.com' && loc.pathname.indexOf('/signin/')>-1){
		let decodeUrl = decodeURIComponent(decodeURIComponent(location.search));
		let urlReg = /destination=https:\/\/auth-devnet(-stg)?\.cisco\.com/;
		if(urlReg.test(decodeUrl)){
			isInProviderPage = true;
		}
	}else if(loc.hostname=='www.facebook.com' && loc.pathname=='/login.php'){
		let decodeUrl = decodeURIComponent(decodeURIComponent(location.search));
		let urlReg = /redirect_uri=https:\/\/auth-devnet(-stg)?\.cisco\.com/;
		if(urlReg.test(decodeUrl)){
			isInProviderPage = true;
		}
	}else if(/sso(.*?)?\.cisco\.com/.test(loc.hostname) && loc.pathname.indexOf('authorization.ping')>-1){
		isInProviderPage = true;
	}else{
		let decodeUrl = decodeURIComponent(decodeURIComponent(location.search));
		let urlReg = /redirect_uri=https:\/\/auth-devnet(-stg)?\.cisco\.com/;
		if(urlReg.test(decodeUrl)){
			isInProviderPage = true;
		}
	}

	if(isInProviderPage){
		window.postMessage({action:Constant.ACTION_TYPES.SHOW_TOOLBAR,
							'from':Constant.MSG_FROM.DEVNET,
							params:{activeStep:1}
		},"*");
	}
}

function onDisableExtension(){
	removeIdentity();
	loadWhenReady(removeToolBar)
	window.dispatchEvent(new CustomEvent(EVT_DISABLE_EXTENSTION));
}

let queryDatas = {};
queryDatas[Constant.KEYS.ENABLE] = Constant.DEFAULT_EXTENSION_ENABLE;
chrome.storage.local.get(queryDatas, function(items){
	let isEnabled = items[Constant.KEYS.ENABLE];
	if(isEnabled){
		bootstrap();
	}else{
		onDisableExtension();
	}
});


chrome.storage.onChanged.addListener(function (changes){
//	console.log('changes', changes);
	let changeInfo = changes[Constant.KEYS.ENABLE];
	if(changeInfo === undefined){return;}
	if(changeInfo.newValue == false){
		onDisableExtension();
	}else{
		bootstrap();
	}
});
