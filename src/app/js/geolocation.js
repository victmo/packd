(function(app){


	app.service('GeolocationService', function($rootScope, $window){
		var self = this;
		self.get = function(callback) {
			if ($window.navigator.geolocation) {
				$window.navigator.geolocation.getCurrentPosition(function(position){
					console.log(position);
					callback(position.coords.latitude, position.coords.longitude);
					$rootScope.$digest();
				});
			}else{
				callback(null, null);
				console.error('Geolocation not supported');
			}
		};
	});


})(angular.module('vm.geolocation', []));

