console.log('this is from content script');
import Constant from './constant';
let addIdentity = function(){
	document.children[0].setAttribute('devnet_cookie_cleaner_installed', true);
}
//if(document.readState != 'complete'){
//	window.onload = loadFn;
//}else{
//	console.log('completed');
	addIdentity();
//}
window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;

	if (event.data.from && (event.data.from == Constant.MSG_FROM.DEVNET)) {
		console.log("Content script received: ", event.data);
		chrome.runtime.sendMessage({data:event.data}, function(response) {
			console.log(response);
		});
	}
}, false);
