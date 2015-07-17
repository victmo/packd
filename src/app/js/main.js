(function(app){


	app.constant(
		'CLIENT_ID',
		'FYLDL4OXPNFGRMJ5M5EETXWGDGZMXKS14VL2V10W11VYZBYP'
	);



	app.constant('RouteStates', {
		mainState: 'main',
		venueState: 'venue',
		connectState: 'connect',
		tokenState: 'token',
		testState: 'test'
	});



	app.config(function ($stateProvider, $urlRouterProvider, RouteStates) {
		$stateProvider
			.state(RouteStates.mainState, {
				url: '/',
				templateUrl: 'app/templates/main.html',
				controller: 'MainController as ctrl'
			})
			.state(RouteStates.venueState, {
				url: '/venue/:venueId',
				templateUrl: 'app/templates/venue.html',
				controller: 'VenueController as ctrl'
			})
			.state(RouteStates.testState, {
				url: '/test',
				templateUrl: 'app/templates/test.html',
				controller: 'TestController as ctrl'
			})
			.state(RouteStates.connectState, {
				url: '/connect',
				templateUrl: 'app/templates/connect.html',
				controller: 'ConnectController as ctrl'
			})
			.state(RouteStates.tokenState, {
				url: "/access_token={accessToken:[0-9a-zA-Z]+}",
				controller: 'AccessTokenController'
			})
		;

		$urlRouterProvider.otherwise('/connect');
	});


})(angular.module('packd', ['packd.controllers', 'ui.router']));

