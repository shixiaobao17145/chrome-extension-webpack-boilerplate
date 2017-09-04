console.log('this is from content script');
import Constant from './constant';
import React from 'react';
import ReactDOM from 'react-dom';
import Toolbar from './components/Toolbar';
import '../css/content.css';
let addIdentity = function(){
	document.children[0].setAttribute('devnet_cookie_cleaner_installed', true);
}
//if(document.readyState != 'complete'){
//	window.onload = loadFn;
//}else{
//	console.log('completed');
addIdentity();
//}

let isToolbarRendered = false;

function loadWhenReady(fn, opts){
	console.log('=> load me!');
	if(document.readyState != 'complete'){
		console.log('1',document.readyState);
		document.addEventListener('readystatechange',function(evt){
			console.log('2');
			let state = evt.target.readyState;
			if(state == 'interactive' || state == 'complete'){
				console.log('3', state);
				if(!isToolbarRendered){
					fn(opts);
				}
			}
		}, false);
	}else{
		fn(opts);
	}
}

const TOOLBAR_ID = 'cl-mst-toolbar';
function showToolBar(opts = {}){
	//	if(isToolbarRendered){
	//		console.log('already reader toolbar');
	//		return;
	//	}
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

window.addEventListener("message", function(event) {

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
			}
			loadWhenReady(showToolBar, opts);
		}else if(data.action == Constant.ACTION_TYPES.REMOVE_TOOLBAR){
			loadWhenReady(removeToolBar);
		}
	}

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
