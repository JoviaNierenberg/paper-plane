'use strict';


// bootstrapping, opening, and closing overlay
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    // create overlay on page the first time extension button is clicked
    if (request.takeOff === true){
    
    	var app = angular.module("PaperPlane", []);

		var html = document.querySelector('html');
		html.setAttribute('ng-app', '');
		html.setAttribute('ng-csp', '');

		var overlay = document.getElementsByTagName("body")[0];
		overlay = overlay.getElementsByTagName("div")[0];
		console.log("overlay: ", overlay);
		overlay.setAttribute('ng-controller', 'MainCtrl');
		app.controller('MainCtrl', function($scope) {
			// if (typeof localStorage.highlighting === 'undefined') {
		 //        localStorage.highlighting = false;
		 //    }
		 //    $scope.selMode = localStorage.highlighting;
		 //    $scope.highlight= function(bool) {
		 //        var select;
		 //        $scope.selMode = bool.toString();
		 //        localStorage.highlighting = bool;
		 //        if (bool) select = 'select-on';
		 //        else select = 'select-off';
		 //        chrome.runtime.sendMessage({command: select});
		 //    }
		});

		var overlayDirective = document.createElement('div');
		overlayDirective.setAttribute('overlay-directive', '');
		overlayDirective.setAttribute('id', 'newDiv');
		document.body.appendChild(overlayDirective);

		app.controller('citationCtrl', function($scope){
			$scope.createCitation = function(citationInfo){
			};
		})

		app.directive("overlayDirective", [ "$sce", function($sce){
			return {
				restrict: 'EA',
				// replace: true,
				templateUrl: $sce.trustAsResourceUrl(chrome.extension.getURL('templates/overlay.html'))
			}
		}]);

		angular.bootstrap(html, ['PaperPlane'], []);
    } 

    // hide overlay from page when extension button is toggled
    else if (request.open === false) {
    	var overlayToggle = document.getElementById('newDiv');
    	console.log("overlayToggle: ", overlayToggle)
    	overlayToggle.setAttribute('class', 'ng-hide');
    }

    // shows overlay from page when extension button is toggled
    else if (request.open === true) {
    	var overlayToggle = document.getElementById('newDiv');
    	console.log("overlayToggle open: ", overlayToggle)
    	overlayToggle.setAttribute('class', 'ng-show');
    } 	
});

// highlight and copy
// $(document).ready(function () {
// 	console.log("document is ready, content script logging!");
// 	var startSelect;
// 	chrome.runtime.sendMessage({getHighlightStatus: true}, function(response) {
// 		startSelect = response.highlighting;
// 		console.log("startSelect inside chrome response", startSelect)
// 	});

// 	function highlight(colour) {  
// 	    if (selected.rangeCount && selected.getRangeAt) {
// 	        range = selected.getRangeAt(0);
// 	    }
// 	    document.designMode = "on";   
// 	    document.body.spellcheck = false;
// 	    if (range) {
// 	        selected.removeAllRanges();
// 	        selected.addRange(range);
// 	    } 
// 	    if (!document.execCommand("HiliteColor", false, colour)) {
// 	        document.execCommand("BackColor", false, colour);
// 	    }
// 	    document.designMode = "off";
// 	}
// 	if (startSelect === "true" || startSelect === true){
// 		highlight("#fcc");
// 	}
// });



console.log('\'Allo \'Allo! Content script');





 