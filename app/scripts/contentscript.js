'use strict';

var app = angular.module("PaperPlane", []);
app.controller('MainCtrl', function($scope) {

// getting data into categories
    $scope.range;
    $scope.selected;
    $scope.highlighted = {};

    // sources
    $scope.sourceCategories = [
      {Name: "website"},
      {Name: "book"},
      {Name: "journal"},
      {Name: "chapter"},
      {Name: "magazine"},
      {Name: "newspaper"}
    ]
    // set source
    $scope.sourceSelected = function(source){
      console.log("source as entered function: ", source)
      $scope.source = source;
      console.log("$scope.source", $scope.source)
    }

    // categories to show based on source
    $scope.bookCategories = ["book title", "publisher name", "city published", "state published", "volume", "edition", "year published"]; // pages needs to include start, end, and non-consecutive
    $scope.chapterCategories = ["chapter title", "book title", "publisher name", "city published", "state published", "volume", "edition", "year published"]; // pages needs to include start, end, and non-consecutive
    $scope.magazineCategories = ["article title", "magazine title", "volume", "publication date"]; // pages needs to include start, end, and non-consecutive
    $scope.newspaperCategories = ["article title", "newspaper title", "edition (late, etc.)", "newspaper section", "city published", "publication date"]; // pages needs to include start, end, and non-consecutive
    $scope.journalCategories = ["article title", "journal title", "journal issue", "journal volume", "journal series", "date published"]; // pages needs to include start, end, and non-consecutive. checkbox for if journal restarts page numbering.
    $scope.onlineCategories = ["article title", "website title", "institution", "date published"];



    $scope.categories = ["author(s)", "editor", "contentTitle", "journalTitle", "publisher", "date", "journalVolume"]
    
  	$(document).on("click", function (v) {
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
          // display correct category
    			$scope.highlighted[$scope.categories.shift()] = $scope.selectedText;
    			$scope.$digest();
        }
      }
    });
    
  $scope.highlighted.title = document.title;
	$scope.highlighted.url = document.location.href;
  $scope.dateAccessed = new Date();
  $scope.apiKey = {key: '5d2fbb2fed6b4aacfc0a329b490cb23d'};



  //send citation to easyBib with put req
  $scope.createCitation = function(citationInfo){
    //set pubtype
    var pubtype;
    if (citationInfo.source === "book" || citationInfo.source === "chapter") pubtype = "pubnonperiodical";
    else if (citationInfo.source === "magazine") pubtype = "pubmagazine";
    else if (citationInfo.source === "newspaper") pubtype = "pubnewspaper";
    else if (citationInfo.source === "journal") pubtype = "pubjournal";
    else if (citationInfo.source === "website") pubtype = "pubonline";
    // testing variables
    $scope.sourceInfo = {
      [citationInfo.source]: { // need make this any citation source, not just websites
        title : $scope.highlighted.contentTitle
      },
      pubtype: {
        main: pubtype
      },
      [pubtype]: {
        title: $scope.highlighted.contentTitle,
        inst: "Organization that owns web site",
        day: "6",
        month: "january",
        year: "2001",
        dayaccessed: "8",
        monthaccessed: "march",
        yearaccessed: "2007",
      },
      contributors: [
        {
          function: "author",
          first: "Luke",
          middle: "A",
          last: "Skywalker"
        }
      ]   
    }
    console.log('citationInfo', citationInfo);
    $scope.infoToPut = JSON.stringify(_.assign( $scope.apiKey, citationInfo, $scope.sourceInfo, $scope.highlighted));
    console.log('$scope.InfoToPut', $scope.infoToPut);
    $.ajax({
      type: "PUT",
      url: "http://api.easybib.com/2.1/rest/cite",
      data: $scope.infoToPut,
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





 