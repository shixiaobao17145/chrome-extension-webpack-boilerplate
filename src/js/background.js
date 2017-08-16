import '../img/icon-128.png'
import '../img/icon-34.png'
import '../img/icon-cisco-idbpo.png'
import * as Cookie from './apis/Cookies';
import Constant from './constant';
Cookie.init();
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ?
					"from a content script:" + sender.tab.url :
					"from the extension", request.data);
		let { action, domains = Constant.DEFAULT_DOMAINS } = request.data;
		let cookies = [];
		if(action == Constant.ACTION_TYPES.DELETE){
			if(domains[0] == "*"){
				cookies = Cookie.removeAll();
			}else{
				domains.forEach(function(domain){
					let list = Cookie.removeCookiesForDomain(domain);
					cookies = cookies.concat(list);
				});
			}
		}

		sendResponse({deletedCookies: cookies, status:'over'});
	});
