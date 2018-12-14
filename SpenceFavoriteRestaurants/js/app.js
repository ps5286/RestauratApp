

// This data is from data.js
var places = places;
var ko = ko;
var google = google;

var Place = function(data) {
	"use strict";
	this.restaurant =  ko.observable(data.Restaurant);
	this.rank = ko.observable(data.Rank);
	this.address = ko.observable(data.Address);
	this.city = ko.observable(data.City);
	this.stateabbr = ko.observable(data.StateAbbr);
	this.zip = ko.observable(data.Zip);
	this.state = ko.observable(data.State);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.marker = ko.observable();
};



// Initializes the google map
var map;
function initializeMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 5,
		center: {lat: 39.842286, lng: -97.646484},
		mapTypeControl: false,
	});

	// Initializes the Knockout code after the map is loaded
	ko.applyBindings(new ViewModel());
}
// Displays an error message if the map does not load
function gmapError() {
	"use strict";
	document.getElementById('gmapError').innerHTML = "<h1>Google Maps did not" +
	"load. Please refresh the page and/or check your internet connection!</h1>";
}

var ViewModel = function() {
	var self = this;

	// Stores place data in the placeList array.
	this.placeList = ko.observableArray();
	places.forEach(function(placeItem) {
		self.placeList.push(new Place(placeItem));
	});

	// Creates the google maps info in window
	var infoWindow = new google.maps.InfoWindow();
	var getInfoWindow;

	// Creates the markers for the map
	var icon = "img/food.png";
	var marker;

	self.placeList().forEach(function(placeItem) {
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
			restaurant: placeItem.restaurant(),
			city: placeItem.city(),
			state: placeItem.state(),
			map: map,
			icon: icon,
		});
		placeItem.marker = marker;

		// This is an Event listener for a marker being clicked
		google.maps.event.addListener(placeItem.marker, 'click', function() {
			infoWindow.open(map, this);
			// Get placeItem info and call the Weather Underground code for weather
				getInfoWindow = jQuery(document).ready(function($) {
					$.ajax({
						url: 'https://api.wunderground.com/api/9459ec0fe3a77f2b/geolookup/conditions/q/' + placeItem.lat() + "," + placeItem.lng() + '.json',
						dataType: "jsonp",
						success: function(parsed_json) {
							var temp_f =
								parsed_json.current_observation.temp_f;
							var weather =
								parsed_json.current_observation.weather;
							infoWindow.setContent('<div class="info"><strong>' +
								placeItem.restaurant() +
								'</strong>' + '<p>' + placeItem.city() + ', ' +
								placeItem.state() + '</p>' +
								'<p><strong>Ranked number ' + placeItem.rank() +
								' for Stan!</strong></p>' +
								'<p>Current Temperature: ' + temp_f + '° F </p>' +
								'<p>Current Weather: ' + weather + '</p>' +
								'<hr>' +
								'<p>Weather info brought to you by:</p>' +
								'<img src="img/wundergroundLogo.png"' +
								'alt="Weather Underground Logo"></div>');
						},
						error: function(XMLHttpRequest, textStatus, errorThrown) {
							alert("Weather Underground failed to load, try again.");
						},
					});
				});

			// creates animatation for the marker and sets a timeout
			placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				placeItem.marker.setAnimation(null);
			}, 6000);

			// Zooms in on the restaurant with satellite view
			map.setCenter(placeItem.marker.getPosition());
			map.setZoom(20);
			map.setMapTypeId('satellite');
		});
	});

	// Opens the restaurant info window when it is clicked from the list.
	self.showPlace = function(placeItem) {
		google.maps.event.trigger(placeItem.marker, 'click');
	};

	// Resets the map if user clicks the reset button on the left.
	var resetButton = document.getElementById('reset');
	resetButton.onclick = reloadPage;
	function reloadPage(){
		window.location.reload();
	}

	// Makes the markers&list visible
	self.visible = ko.observableArray();
	self.placeList().forEach(function(place) {
		self.visible.push(place);
	});

	// Allows to search by Place, City, or State
	self.searchInput = ko.observable('');
	self.filterPlaces = function() {
		var userInput = self.searchInput().toLowerCase();
		self.visible.removeAll();
		self.placeList().forEach(function(place) {
			place.marker.setVisible(false);
			if (place.restaurant().toLowerCase().indexOf(userInput) >= 0) {
				self.visible.push(place);
			} else if (place.city().toLowerCase().indexOf(userInput) >= 0) {
				self.visible.push(place);
			} else if (place.state().toLowerCase().indexOf(userInput) >= 0) {
				self.visible.push(place);
			}
		});
		self.visible().forEach(function(place) {
			place.marker.setVisible(true);
		});
	};
};
