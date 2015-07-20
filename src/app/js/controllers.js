(function(app){

	
	// Custom filters _______________________________________________________________________________________
	
	app.filter('OrderByPopularity', function(){
		return function(items, now){
			if(now){
				return items.sort(function(a, b){
					return b.hereNow.count - a.hereNow.count;
				});

			}else{
				return items.sort(function(a, b){
					return b.stats.checkinsCount - a.stats.checkinsCount;
				});
			}
		};
	});

	app.filter('FoursquarePhotosFilter', function(){
		return function(items){
			return items.map(function(item){
				return item.prefix + '600x400' + item.suffix;
			});
		};
	});





	// Controllers __________________________________________________________________________________________

	app.controller('AccessTokenController', function($state, $stateParams, FoursquareSdk, RouteStates){
		console.log($stateParams);
		FoursquareSdk.connect($stateParams.accessToken);
		$state.go(RouteStates.mainState);
	});




	app.controller('ConnectController', function(CLIENT_ID){
		var self = this,
			clientId = CLIENT_ID,
			redirectUri = location.origin + location.pathname
		;

		var connectUri = 'https://foursquare.com/oauth2/authenticate?response_type=token' +
			'&client_id=' + clientId +
			'&redirect_uri=' + redirectUri
		;
		console.log('OAuth uri: ' + connectUri);

		self.onConnect = function(){
			window.document.location.href = connectUri;
		};

	});




	app.controller('MainController', function($state, $filter, FoursquareSdk, GeolocationService, RouteStates) {
		var self = this;
		var maxZIndex = 0;
		
		// TODO: Create a service to maintain state between routes
		// This is to avoid reloading the map and calling the API again.

		self.searchTypes = [
			{ label: 'In general', value: false },
			{ label: 'Right now', value: true }
		];
		self.searchType = self.searchTypes[0].value;
		self.now = self.searchType; // Show popular now or in the past couple of months?
		self.selectedVenueIndex = null;
		

		if(!FoursquareSdk.isConnected()){
			console.log('Not connected');
			$state.go(RouteStates.connectState);
		}

		self.map = { 
			center: { latitude: 0, longitude: 0 }, 
			zoom: 3, 
			control: {},
			markers: []
		};

		GeolocationService.get(function(lat, lng){
			self.map.center = {latitude: lat, longitude: lng};
			self.map.zoom = 15;
			self.loadVenues(self.map.center);
		});

		self.loadVenues = function(position){
			var method = 'trending';
			var params = {
				ll: position.latitude + ',' + position.longitude,
				limit: 30,
				radius: 1500,
				m: 'swarm',
			};
			if(!self.now){
				method = 'search';
				params.intent = 'browse';
				params.categoryId = "4d4b7105d754a06374d81259,4d4b7105d754a06376d81259"; // Food & Nightlife
			}
			self.venues = null;

			FoursquareSdk.Venues[method](params, function(valid, response){
				if(valid){
					self.venues = $filter('OrderByPopularity')(response, self.now);
					self.map.markers = self.venues.map(function(v, i){
						return {
							id: v.id,
							index: i,
							title: v.name,
							latitude: v.location.lat,
							longitude: v.location.lng,
							zIndex: maxZIndex++, // BUG: The module is not reading this value :(
							icon: {
								url: 'assets/images/markers.png',
								size: new google.maps.Size(33, 42),
								scaledSize: new google.maps.Size(3149, 177),
								origin: new google.maps.Point(35 * i, 45 * 0), // Sprite 35x45, Y => 0: blue, 1: white-blue, 2: orange, 3: white-orange
								anchor: new google.maps.Point(16, 38)
							}
						};
					});
				}else{
					console.error(response.errorDetail);
				}
			});
		};

		self.showVenue = function(venueId){
			console.log(venueId);
			$state.go(RouteStates.venueState, {venueId: venueId});
		};

		self.highlightVenue = function(i){
			if(self.selectedVenueIndex !== null){
				self.map.markers[self.selectedVenueIndex].icon.origin = new google.maps.Point(35 * self.selectedVenueIndex, 45 * 0);
			}
			self.map.markers[i].icon.origin = new google.maps.Point(35 * i, 45 * 3); // 0: blue, 1: white-blue, 2: orange, 3: white-orange
			self.map.markers[i].zIndex = maxZIndex++;
			self.map.center.latitude = self.map.markers[i].latitude;
			self.map.center.longitude = self.map.markers[i].longitude;
			//TODO: Auto-scroll list
			self.selectedVenueIndex = i;
		};

		self.pinClicked = function (marker){
			//self.showVenue(marker.model.id);
			self.highlightVenue(marker.model.index);
		};

		self.searchArea = function(){
			self.map.zoom = 15;
			self.loadVenues(self.map.center);
		};

		// Form! <----------------------------------------------

		self.onSubmit = function(){
			if(self.searchTypeForm.$valid){
				self.now = self.searchType;
				self.searchArea();
			}else{
				alert('Please select a valid search criteria.');
			}
		};
	});




	app.controller('VenueController', function($scope, $state, $stateParams, $filter, FoursquareSdk, RouteStates) {
		var self = this;
		self.venue = null;
		
		if(!FoursquareSdk.isConnected()){
			console.log('Not connected');
			$state.go(RouteStates.connectState);
		}

		FoursquareSdk.Venues.get({
			venueId: $stateParams.venueId
		}, function(valid, response){
			if(valid){
				self.venue = response;
				// Only filter once, every time a venue is loaded,
				// otherwise we'll get a digest overflow
				self.venuePhotos = $filter('FoursquarePhotosFilter')(self.venue.photos.groups[0].items);
			}else{
				console.error(response.errorDetail);
			}
		});

	});




	app.controller('TestController', function($scope, $state, FoursquareSdk, GeolocationService) {
		var self = this;
		
		self.ll = '';
		self.geolocation = null;

		if(!FoursquareSdk.isConnected()){
			console.log('Not connected');
			$state.go('connect');
		}

		self.getUser = function (userId) {
			FoursquareSdk.Users.get({
				userId: userId
			}, function(isValid, response){
				self.data =  response;
			});
		};
		
		self.getVenue = function (venueId) {
			FoursquareSdk.Venues.get({
				venueId: venueId
			}, function(isValid, response){
				self.data = response;
			});
		};

		self.getVenueStats = function (venueId) {
			FoursquareSdk.Venues.stats({
				venueId: venueId
			}, function(isValid, response){
				self.data = response;
			});
		};
		
		self.searchVenues = function (ll) {
			FoursquareSdk.Venues.search({
				ll: ll,
				limit: 20,
				radius: 800,
				intent: 'browse',
				m: 'foursquare'
			}, function(isValid, response){
				self.data = response;
			});
		};

		self.trendingVenues = function (ll) {
			FoursquareSdk.Venues.trending({
				ll: ll,
				limit: 20,
				radius: 800,
				m: 'swarm'
			}, function(isValid, response){
				self.data = response;
			});
		};

		self.getGeolocation = function(){
			GeolocationService.get(function(lat, lng){
				self.ll = lat+','+lng;
			});
		};
		
	});


})(angular.module('packd.controllers', ['vm.foursquare', 'vm.geolocation', 'vm.superAwesomeSlideshow', 'ui.router', 'uiGmapgoogle-maps']));

