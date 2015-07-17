(function(app){

	app.value('API', {
		base: 'https://api.foursquare.com/v2',
		version: '20150712'
	});

	app.factory('FoursquareUsersResource', function($resource, API) {
		return $resource(
			API.base + '/users/:userId', 
			{
				userId: '@userId',
				v: API.version
			},
			{
				get: {
					method: 'GET',
					isArray: false
				}
			}
		);
	});

	app.factory('FoursquareVenuesResource', function($resource, API) {
		return $resource(
			API.base + '/venues/:venueId/:action',
			{
				venueId: '@venueId',
				action: '@action',
				v: API.version
			},
			{
				get: {
					method: 'GET',
					isArray: false
				}
			}
		);
	});



	app.service('FoursquareApiService', function(FoursquareUsersResource, FoursquareVenuesResource){
		var self = this;
		self.token = null;

		function callApi(resource, params, callback) {
			if(!self.token){
				callback(false, {
					code: -1,
					errorType: "auth",
					errorDetail: "Not connected to Foursquare"
				});
			}else{
				params.oauth_token = self.token;
				resource.get(params).$promise.then(
					
					function onCallApiSuccess(response) {
						if(response.meta.code == 200 ) { // All good
							callback(true, response.response);
						} else {
							callback(false, response.meta);
						}
					}, 
					
					function onCallApiError(error) {
						if(error.data && error.data.meta) {
							callback(false, error.data.meta);
						}else{
							callback(false, {
								code: error.status,
								errorType: "network",
								errorDetail: "Unreachable host"
							});
						}
					}
				);
			}
		}
					

		// Public functions
		self.User = {
			get: function(params, callback){ 
				callApi(FoursquareUsersResource, params, callback);
			}
		};	
		self.Venues = {
			get: function(params, callback){
				callApi(FoursquareVenuesResource, params, callback);
			},
			stats: function(params, callback){
				params.action = 'stats';
				callApi(FoursquareVenuesResource, params, callback);
			},
			search: function(params, callback){
				params.action = 'search';
				callApi(FoursquareVenuesResource, params, callback);
			},
			trending: function(params, callback){
				params.action = 'trending';
				callApi(FoursquareVenuesResource, params, callback);
			}
		};
	});



	app.service('FoursquareSdk', function(FoursquareApiService){
		var self = this,
			connected = false
		;
		
		self.isConnected = function () {
			if(!FoursquareApiService.token){
				self.disconnect();
			}
			return connected;
		};

		self.connect = function (accessToken) {
			FoursquareApiService.token = accessToken;
			connected = true;
		};

		self.disconnect = function () {
			FoursquareApiService.token = null;
			connected = false;
		};


	
		self.User = {
			get: function(params, completionCallback){
				FoursquareApiService.Users.get(params, function(isValid, response){
					if(isValid){
						completionCallback(true, response.user);
					}else{
						completionCallback(false, response);
					}
				});
			}
		};




		self.Venues = {
			get: function(params, completionCallback){
				FoursquareApiService.Venues.get(params, function(isValid, response){
					if(isValid){
						completionCallback(true, response.venue);
					}else{
						completionCallback(false, response);
					}
				});
			},

			stats: function(params, completionCallback){
				FoursquareApiService.Venues.stats(params, function(isValid, response){
					if(isValid){
						completionCallback(true, response.venue);
					}else{
						completionCallback(false, response);
					}
				});
			},

			search: function(params, completionCallback){
				FoursquareApiService.Venues.search(params, function(isValid, response){
					if(isValid){
						completionCallback(true, response.venues);
					}else{
						completionCallback(false, response);
					}
				});
			},

			trending: function(params, completionCallback){
				FoursquareApiService.Venues.trending(params, function(isValid, response){
					if(isValid){
						completionCallback(true, response.venues);
					}else{
						completionCallback(false, response);
					}
				});
			}
		};
		
	});

})(angular.module('vm.foursquare', ['ngResource']));

