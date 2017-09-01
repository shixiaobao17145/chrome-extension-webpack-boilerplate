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

function loadWhenReady(fn, simpleMode=true){
	let targetState = 'complete';
	if(simpleMode){
		targetState = 'interactive';
	}
	if(document.readyState != targetState){
		window.addEventListener('readystatechange',function(){
			if(document.readyState == targetState){
				fn();
			}
		}, false);
	}else{
		fn();
	}
}

function showToolBar(){
	let d = document.createElement('div');
	d.id = 'cl-mst-toolbar';
	document.body.appendChild(d);
	ReactDOM.render(<Toolbar/>, d);
}

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	//	if (event.source != window)
	//		return;

	if (event.data.from && (event.data.from == Constant.MSG_FROM.DEVNET)) {
		console.log("Content script received: ", event.data);
		chrome.runtime.sendMessage({data:event.data}, function(response) {
			console.log(response);
		});
	}

	if(event.data.action == Constant.ACTION_TYPES.SHOW_TOOLBAR){
		loadWhenReady(showToolBar);
	}
}, false);

//show toolbar by default
window.postMessage({action:Constant.ACTION_TYPES.SHOW_TOOLBAR},"*");
