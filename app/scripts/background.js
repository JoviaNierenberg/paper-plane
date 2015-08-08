'use strict';

var clickState;
var urlsVisited = {};
// var windowself= window.self();
// bootstrapping, opening, and closing overlay
chrome.browserAction.onClicked.addListener(function(tab) { 
	console.log('window.top', window.top);

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log('tabs', tabs[0].url);
		console.log('urlsVisited', urlsVisited)
		//if extension has been bootstrapped, and we go to a NEW page, reset it
	  if(!urlsVisited[tabs[0].url] && clickState !== undefined){
	  	console.log('here');
	  	clickState = undefined;
	  };

	  //if extension has been bootstrapped, and we go BACK to a page, reset clickState
	  // if(urlsVisted[tab[0].url] && clickState){

	  // }
		// first time extension button is clicked, bootstrap and open overlay
		if (clickState === undefined){
			console.log('bootstrapping!', urlsVisited)
			chrome.tabs.sendMessage(tabs[0].id, {takeOff: true}, function(response) {
				
			});
			clickState = true;
			urlsVisited[tabs[0].url]=true;
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

// // listening for an event (one-time request) coming from the POPUP
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	if (request.command === "select-on") {
// 		highlighting(true);		
// 	}
// 	if (request.command === "select-off") {
// 		highlighting(false);
// 	}
// 	if (request.getHighlightStatus) {
// 		sendResponse({highlighting: localStorage.highlighting});
// 	}
// });

// function highlighting(onOrOff) {
// 	chrome.tabs.query({active: true}, function (tabs) {		
// 		chrome.tabs.sendMessage(tabs[0].id, {
// 			highlight: onOrOff
// 		}, function (response) {
// 			console.log("response after sending getstuff to contentJS", response);
// 		});
// 	});
// }