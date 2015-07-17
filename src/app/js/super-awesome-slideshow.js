(function(app){

	app.directive('vmSuperAwesomeSlideshow', function(){
		return {
			template: '<img src="{{ctrl.currentImage}}" alt="">',
			controller: 'vmSuperAwesomeSlideshowController as ctrl',
			scope: {
				images: '=vmSuperAwesomeSlideshow'
			},
			bindToController: true
		};
	});
	app.controller('vmSuperAwesomeSlideshowController', function($timeout){
		var self = this;
		
		console.log('===============');
		console.log(self.images); // WHY IS THIS EMPTY?????????  <-------------------------------
		
		self.currentImage = self.images[0];
		var currIndex = -1;
		function showImage(n){
			self.currentImage = self.images[n];
			currIndex = n;
		}
		function showNext(auto){
			var n = currIndex + 1;
			if(n >= self.images.length) { n = 0; }
			showImage(n);
			if(auto){
				$timeout(function(){
					showNext(true);
				}, 3000);
			}
		}
		showNext(true);
	});

})(angular.module('vm.superAwesomeSlideshow', []));
