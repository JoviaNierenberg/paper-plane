'use strict';

window.addEventListener("load", function(){
	var app = angular.module("PaperPlane", []);

	var html = document.querySelector('html');
	html.setAttribute('ng-app', '');
	html.setAttribute('ng-csp', '');

	var overlay = document.getElementById("body");
	overlay.setAttribute('ng-controller', 'MainCtrl');
	app.controller('MainCtrl', function($scope) {});

	var overlayDirective = document.createElement('div');
	overlayDirective.setAttribute('overlay-directive', '');
	overlay.appendChild(overlayDirective);

	app.directive("overlayDirective", [ "$sce", function($sce){
		return {
			restrict: 'EA',
			replace: true,
			template: "<div>Hello</div>"//$sce.trustAsResourceUrl(chrome.extension.getURL('.././templates/overlay.html'))
		}
	}]);

	angular.bootstrap(html, ['PaperPlane'], []);
});

console.log('\'Allo \'Allo! Content script');
