'use strict';

var clickState;
var urlsVisited = {};
// var windowself= window.self();

// bootstrapping, opening, and closing overlay
chrome.browserAction.onClicked.addListener(function(tab) { 

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log('tabs[0]',tabs[0]);
		//if extension has been bootstrapped, and we go to a NEW page, reset it  
	  if(!urlsVisited[tabs[0].url] && clickState !== undefined){
	  	clickState = undefined;
	  };

		if (clickState === undefined){
			console.log('bootstrapping!');
			chrome.tabs.sendMessage(tabs[0].id, {takeOff: true}, function(response) {
				
			});
			clickState = true;
			urlsVisited= {[tabs[0].url]: true};
		} 

		// close overlay with extension button
		else if (clickState === true) {
			console.log("in else in background.js in true", "clickstate", clickState)
			chrome.tabs.sendMessage(tabs[0].id, {open: false}, function(response) {	
		  });
		  clickState = false;
		}

		// open overlay with extension button
		else if (clickState === false) {
			console.log("in else in background.js in false", "clickstate", clickState);
			chrome.tabs.sendMessage(tabs[0].id, {open: true}, function(response) {			
		  });
		  clickState = true;
		}
	  
	});

});

chrome.runtime.onMessage.addListener(function(message) {
    if (message && message.type == 'copyOne') {
        var input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = message.text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
    }
});

chrome.runtime.onMessage.addListener(function(message) {
    if (message && message.type == 'copyAll') {
        var input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = message.text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
    }
});