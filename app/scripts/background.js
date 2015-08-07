'use strict';

var clickState;

chrome.browserAction.onClicked.addListener(function(tab) { 

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		
		// first time extension button is clicked, bootstrap and open overlay
		if (clickState === undefined){
			chrome.tabs.sendMessage(tabs[0].id, {takeOff: true}, function(response) {
				
			});
			clickState = true;
		} 

		// close overlay with extension button
		else if (clickState === true) {
			console.log("in else in background.js")
			chrome.tabs.sendMessage(tabs[0].id, {open: false}, function(response) {
				
		  	});
		  	clickState = false;
		}

		// open overlay with extension button
		else if (clickState === false) {
			console.log("in else in background.js")
			chrome.tabs.sendMessage(tabs[0].id, {open: true}, function(response) {
				
		  	});
		  	clickState = true;
		}
	  
	});

});

