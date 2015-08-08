'use strict';

var app = angular.module("PaperPlane", []);
app.controller('MainCtrl', function($scope) {

    $scope.range;
    $scope.selected;

    $scope.highlighted = {};
    $scope.categories = ["author(s)", "editor", "content title", "journal title", "publisher", "date", "journal volume"]
    

    	$(document).on("click", function (v) {
    		console.log("categories length: ", $scope.categories.length)
    		if ($scope.categories.length > 0){
		    $scope.elem = document.elementFromPoint(v.clientX, v.clientY);
		    $scope.found = false;

		    while ($scope.elem.parentNode) {
		      if ($scope.elem.tagName.toLowerCase() === "a" || $scope.elem.tagName.toLowerCase() === "input" || $scope.elem.tagName.toLowerCase() === "textarea" || $scope.elem.tagName.toLowerCase() === "select") $scope.found = true;
			      $scope.elem = $scope.elem.parentNode;
			    }
		    
			$scope.range, $scope.selected = window.getSelection();
			$scope.selectedText = $scope.selected.toString();    
	        if ($scope.selectedText.trim() !== "") {
				$scope.highlighted[$scope.categories.shift()] = $scope.selectedText;
				console.log("$scope.categories: ", $scope.categories)
				$scope.$digest();
	        }
			console.log('a page', $scope.highlighted);
	    }
    });
    
    $scope.highlighted.title = document.title;
	$scope.highlighted.url = document.location.href;
  $scope.dateAccessed = new Date();
  $scope.apiKey = {key: '5d2fbb2fed6b4aacfc0a329b490cb23d'};

  //send citation to easyBib with put req
  $scope.createCitation = function(citationInfo){
    console.log('citationInfo', citationInfo);
    $scope.infoToPut = _.assign(citationInfo, $scope.highlighted, $scope.apiKey);
    console.log('$scope.InfoToPut', $scope.infoToPut);
    $.ajax({
      type: "PUT",
      url: "http://api.easybib.com/2.1/rest/cite",
      data: JSON.stringify($scope.infoToPut),
      dataType: 'json', // Choosing a JSON datatype
      success: function(data){
        console.log('success', data);
      }
    })
  };
});


// bootstrapping, opening, and closing overlay
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    // create overlay on page the first time extension button is clicked
    if (request.takeOff === true){
    

		var html = document.querySelector('html');
		html.setAttribute('ng-app', '');
		html.setAttribute('ng-csp', '');

		var overlay = document.getElementsByTagName("body")[0];
		overlay = overlay.getElementsByTagName("div")[0];
		console.log("overlay: ", overlay);
		overlay.setAttribute('ng-controller', 'MainCtrl');
		

		var overlayDirective = document.createElement('div');
		overlayDirective.setAttribute('overlay-directive', '');
		overlayDirective.setAttribute('id', 'newDiv');
		document.body.appendChild(overlayDirective);

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

console.log('\'Allo \'Allo! Content script');





 