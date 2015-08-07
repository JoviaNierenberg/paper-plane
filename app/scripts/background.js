'use strict';

var clickState;

// bootstrapping, opening, and closing overlay
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

// listening for an event (one-time request) coming from the POPUP
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.command === "select-on") {
		highlighting(true);		
	}
	if (request.command === "select-off") {
		highlighting(false);
	}
	if (request.getHighlightStatus) {
		sendResponse({highlighting: localStorage.highlighting});
	}
});

function highlighting(onOrOff) {
	chrome.tabs.query({active: true}, function (tabs) {		
		chrome.tabs.sendMessage(tabs[0].id, {
			highlight: onOrOff
		}, function (response) {
			console.log("response after sending getstuff to contentJS", response);
		});
	});
}