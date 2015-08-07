'use strict';

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
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
    else if (request.open === false) {
    	var overlayToggle = document.getElementById('newDiv');
    	console.log("overlayToggle: ", overlayToggle)
    	overlayToggle.setAttribute('class', 'ng-hide');
    }
    else if (request.open === true) {
    	var overlayToggle = document.getElementById('newDiv');
    	console.log("overlayToggle open: ", overlayToggle)
    	overlayToggle.setAttribute('class', 'ng-show');
    }
    	
});

console.log('\'Allo \'Allo! Content script');
 