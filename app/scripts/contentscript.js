'use strict';

var app = angular.module("PaperPlane", []);
app.controller('MainCtrl', function($scope) {

// getting data into categories
    $scope.range;
    $scope.selected;
    $scope.highlighted = {};

    // sources
    $scope.sourceCategories = {
      "website": ["article title", "author(s)", "website title", "institution", "date published"], 
      "book": ["book title", "author(s)", "publisher", "city", "state", "volume", "edition", "year published"], // pages needs to include start, end, and non-consecutive
      "journal": ["article title", "author(s)", "journal title", "issue", "volume", "series", "date published"], // pages needs to include start, end, and non-consecutive. checkbox for if journal restarts page numbering.
      "chapter": ["chapter title", "author(s)", "book title", "publisher name", "city published", "state published", "volume", "edition", "year published"], // pages needs to include start, end, and non-consecutive
      "magazine": ["article title", "author(s)", "magazine title", "vol", "publication date"],// pages needs to include start, end, and non-consecutive
      "newspaper": ["article title", "author(s)", "newspaper title", "edition (late, etc.)", "newspaper section", "city published", "publication date"] // pages needs to include start, end, and non-consecutive 
    }
    // set source
    $scope.sourceSelected = function(source){
      $scope.source = source;
      // highlighting
      $(document).on("click", function (v) {
        console.log("$scope.source: ", $scope.source)
        console.log("fields: ", $scope.sourceCategories[$scope.source])

        if ($scope.sourceCategories[$scope.source].length > 0){
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
           $scope.highlighted[$scope.sourceCategories[$scope.source].shift()] = $scope.selectedText;
           $scope.$digest();
          }
        }
      });
    }
    
  // $scope.highlighted.title = document.title;
	$scope.highlighted.url = document.location.href;
  $scope.dateAccessed = new Date();
  $scope.apiKey = {key: '5d2fbb2fed6b4aacfc0a329b490cb23d'};


  //send citation to easyBib with put req
  $scope.createCitation = function(citationInfo){
    console.log("citationInfo: ", citationInfo)
    console.log("$scope.highlighted: ", $scope.highlighted)
    //set pubtype
    var pubtype, title, publisher;
    if ($scope.source === "book" || $scope.source === "chapter") {
      pubtype = "pubnonperiodical";
      $scope.highlighted.title = $scope.highlighted["book title"];
      // state
      // vol
      // editiontext
      // year

    }
    else if ($scope.source === "magazine") {
      pubtype = "pubmagazine";
      // title
      // vol
      // day
      // month
      // year

    }
    else if ($scope.source === "newspaper") {
      pubtype = "pubnewspaper";
      // title
      // edition
      // section
      // city
      // day
      // month
      // year
    }
    else if ($scope.source === "journal") {
      pubtype = "pubjournal";
      // title
      // issue
      // volume
      // series
      // year
    }
    else if ($scope.source === "website") {
      pubtype = "pubonline";
      // title
      // inst
      // day
      // month
      // year
      // url
      // day accessed
      // month accessed
      // year accessed
    }
    // format date
    // format authors
    // format [pubtype] section
    // format pages
    if (citationInfo.pages){
      var pageRange = citationInfo.pages.split("-");
      $scope.highlighted.start = pageRange[0];
      $scope.highlighted.end = pageRange[1];
    }
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
      contributors: [
        {
          function: "author",
          first: "Luke",
          middle: "A",
          last: "Skywalker"
        }
      ]   
    };

    console.log('citationInfo', citationInfo);
    $scope.infoToPut = JSON.stringify(_.assign( $scope.apiKey, $scope.sourceInfo));
    console.log('$scope.InfoToPut', $scope.infoToPut);
    
    //ajax request to easy bib api with citation in formation
    $.ajax({
      type: "PUT",
      url: "http://api.easybib.com/2.1/rest/cite",
      data: $scope.infoToPut,
      dataType: 'json', // Choosing a JSON datatype
      success: function(data){
        console.log('success', data);
        var storage = chrome.storage.local;
        var projectName = citationInfo.projectName;
        console.log('projectName', projectName);
        //use project name as key

        //if already data in storage then push it in
        storage.get('projectName', function(result){
          console.log('result', result);
          if(Object.keys(result).length !== 0){
            var key = Object.keys(result)[0].toString()
            console.log('key', key);
            var currCitations = result[key];
            console.log('curr citations', currCitations);
            var updatedCitations = currCitations.concat([data.data]);
            console.log('updatedCitations', updatedCitations);
            storage.set({'projectName' : updatedCitations }, function(result){
              console.log('success in storage when already created a citation!', result);
            });
          }else{
          //call function to store data in local storage
          storage.set({'projectName': [data.data]}, function(){
            console.log('Success in storage! created a new citation!');
          });
        }
       
       //check it worked
       storage.get('projectName', function(result){
          console.log('check it worked', result);
       });

      });

    }
  });

};

  $scope.copyCitations=function(){
     chrome.storage.local.get('projectName', function(result){
          //at key, loop through array and grab each citation
          //select all 
          //copy 
          $scope.citationsClipped = result['projectName'].map(function(citation){
            return citation;
          });
          $scope.$digest();
          console.log('all citations', $scope.citationsClipped);
          // $("body").append("<input type='text' id='temp' style='position:absolute;opacity:0;'>");
          // $("#temp").val($(citations).text()).select();
          // document.execCommand("copy");
          // $("#temp").remove();
          // console.log('Citations clipped!', result);
      });
  }

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





 