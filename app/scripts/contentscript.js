'use strict';

var app = angular.module("PaperPlane", ['ngSanitize']);
app.controller('MainCtrl', function($scope, $sce) {

// getting data into categories
    $scope.range;
    $scope.selected;
    $scope.highlighted = {};

    // sources
    $scope.sourceCategories = {
      "website": ["article title", "author(s)", "website title", "institution", "date published"], 
      "book": ["book title", "author(s)", "publisher", "city, state", "volume", "edition", "year published"], // pages needs to include start, end, and non-consecutive
      "journal": ["article title", "author(s)", "journal title", "issue", "volume", "series", "date published"], // pages needs to include start, end, and non-consecutive. checkbox for if journal restarts page numbering.
      "chapter": ["chapter title", "author(s)", "book title", "publisher name", "city, state", "volume", "edition", "year published"], // pages needs to include start, end, and non-consecutive
      "magazine": ["article title", "author(s)", "magazine title", "volume", "date published"],// pages needs to include start, end, and non-consecutive
      "newspaper": ["article title", "author(s)", "newspaper title", "edition (late, etc.)", "newspaper section", "city published", "date published"] // pages needs to include start, end, and non-consecutive 
    }

    // show current cat in instructions
    $scope.current = $scope.$index || 0;
    $scope.setCurrent = function(num){
      $scope.current = num || 0;
      $scope.$index = num;
      // console.log("IN SET CURRENT FUNCTION")
      // console.log("current: ", $scope.current)
      // console.log("$sindex: ", $scope.$index)
    }

    // set source
    $scope.sourceSelected = function(source){
      $scope.source = source;
      // highlighting
      if ($scope.source != undefined){
        $(document).on("click", function (v) {

          if ($scope.current < $scope.sourceCategories[$scope.source].length){
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
              $scope.highlighted[$scope.sourceCategories[$scope.source][$scope.current]] = $scope.selectedText;
              $scope.$index = $scope.current
              // console.log("IN HIGHLIGHTING FUNCTION")
              // console.log("current before ++: ", $scope.current)
              // console.log("$index: ", $scope.$index)
              $scope.current++;
              // console.log("current after ++: ", $scope.current)
              $scope.$digest();
            }
          }
        });
      }
    } 

    
  // set url and date accessed
	$scope.highlighted.url = document.location.href;
  $scope.dateAccessed = new Date();
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  $scope.apiKey = {key: '5d2fbb2fed6b4aacfc0a329b490cb23d'};

  //send citation to easyBib with put req
  $scope.createCitation = function(citationInfo){
    console.log("$scope.highlighted: ", $scope.highlighted)
    // references common name when setting easybib name
    $scope.highlighted.title = $scope.highlighted["book title"] || $scope.highlighted["magazine title"] || $scope.highlighted["newspaper title"] || $scope.highlighted["journal title"] || $scope.highlighted["website title"];
    if ($scope.highlighted["volume"]) $scope.highlighted.vol = $scope.highlighted["volume"];
    
    // format date
    var dateJSFormat = moment($scope.highlighted["date published"], ["MM-DD-YYYY", "YYYY-MM-DD", "MM/DD/YYYY", "M/D/YYYY", "MMMM Do YYYY", "MMM D YYYY", "MMMM Do YYYY LT", "MMM D YYYY LT", "dddd, MMMM Do YYYY LT", "ddd, MMM D YYYY LT", "YYYY MMM D", "YYYY MMM DD"]).toDate();
    $scope.highlighted.day = dateJSFormat.getDate();
    $scope.highlighted.month = monthNames[dateJSFormat.getMonth()];
    $scope.highlighted.year = dateJSFormat.getUTCFullYear();

    // format authors
    if ($scope.highlighted["author(s)"] != undefined) {
      var authorsArr = $scope.highlighted["author(s)"].replace(/[0-9]/g, '').split(", ");
      var authorsObjArr = [];
      authorsArr.forEach(function(author){
        var authorObj = {
          function: "author",
          first: author.split(" ")[1].split("")[0],
          middle: author.split(" ")[1].split("")[1],
          last: author.split(" ")[0]
        }
        authorsObjArr.push(authorObj)
      })
      console.log("authorsObjArr", authorsObjArr)
    }

    // format pages
    if (citationInfo.pages){
      var pageRange = citationInfo.pages.split("-");
      $scope.highlighted.start = pageRange[0];
      $scope.highlighted.end = pageRange[1];
    }
    //set pubtype
    var pubtype;
    if ($scope.source === "book" || $scope.source === "chapter") {
      pubtype = "pubnonperiodical";   
      if ($scope.highlighted["city, state"] != undefined){
        $scope.highlighted.city = $scope.highlighted["city, state"].split(", ")[0];
        $scope.highlighted.state = $scope.highlighted["city, state"].split(", ")[1];    
      }
      $scope.highlighted.editiontext = $scope.highlighted["edition"];
      $scope.highlighted.year = $scope.highlighted["year published"];
    }
    else if ($scope.source === "magazine") pubtype = "pubmagazine";
    else if ($scope.source === "newspaper") {
      pubtype = "pubnewspaper";
      $scope.highlighted.edition = $scope.highlighted["edition (late, etc.)"];
      $scope.highlighted.section = $scope.highlighted["newspaper section"];
      $scope.highlighted.city = $scope.highlighted["city published"];
    }
    else if ($scope.source === "journal") pubtype = "pubjournal";
    else if ($scope.source === "website") {
      pubtype = "pubonline";
      $scope.highlighted.inst = $scope.highlighted["institution"];
      $scope.highlighted['Day_Accessed'] = $scope.dateAccessed.getDate();
      $scope.highlighted['Month_Accessed'] = monthNames[$scope.dateAccessed.getMonth()];
      $scope.highlighted['Year_Accessed'] = $scope.dateAccessed.getUTCFullYear();
    }

    // formats source info
    $scope.sourceInfo = {
      source: $scope.source,
      style: citationInfo.style,
      [$scope.source]: { 
        title : $scope.highlighted["article title"] || $scope.highlighted["book title"] || $scope.highlighted["chapter title"]
      },
      pubtype: {
        main: pubtype
      },
      [pubtype]: $scope.highlighted,
      contributors: authorsObjArr   
    };

    console.log('citationInfo', citationInfo);
    $scope.infoToPut = JSON.stringify(_.assign( $scope.apiKey, $scope.sourceInfo));
    console.log('$scope.InfoToPut', $scope.infoToPut);
    var storage = chrome.storage.local;
    //ajax request to easy bib api with citation in formation
    $.ajax({
      type: "PUT",
      url: "http://api.easybib.com/2.1/rest/cite",
      data: $scope.infoToPut,
      dataType: 'json', // Choosing a JSON datatype
      success: function(data){
        console.log("data from success: ", data)
        var projectName = citationInfo.projectName;
         $scope.lastCitation = data.data;
        //use project name as key
        chrome.runtime.sendMessage({
              type: 'copyOne',
              text:  data.data
        });

        $scope.lastCitation = data.data;
        console.log('$scope.lastCitation', $scope.lastCitation);
        $scope.$digest();
        //if already data in storage then push it in
        storage.get('projectName', function(result){
          if(Object.keys(result).length !== 0){
            var key = Object.keys(result)[0].toString()
            var currCitations = result[key];
            var updatedCitations = currCitations.concat([data.data]);
            storage.set({'projectName' : updatedCitations }, function(result){
            });
          }else{
          //call function to store data in local storage
          storage.set({'projectName': [data.data]}, function(){
            console.log('Success in storage! created a new citation!');
          });
        }
      });
    }

  });

};

  $scope.copyCitations=function(){
     chrome.storage.local.get('projectName', function(result){
          //if no citations, short circuit
          if(!result['projectName']){return}

          $scope.citationsClipped = result['projectName'].map(function(citation){
            return citation;
            // return $sce.parseAsHtml(citation); //////// this should display the citations we get back from easybib with proper formatting, but doesn't
          });
          $scope.$digest();
          console.log('all citations', $scope.citationsClipped);
          chrome.runtime.sendMessage({
              type: 'copyAll',
              text:  $scope.citationsClipped
          });
          console.log('Citations clipped!', result);
      });
  }

  $scope.clearCitations=function(){
    chrome.storage.local.clear(function(){
      $scope.citationsClipped = [];
      $scope.$digest();
    });
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





 