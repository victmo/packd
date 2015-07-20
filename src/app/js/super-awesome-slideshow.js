(function(app){

	app.directive('vmSuperAwesomeSlideshow', function(){
		return {
			template: '<img src="{{ctrl.currentImage}}" alt="">',
			controller: 'VmSuperAwesomeSlideshowController as ctrl',
			scope: {
				images: '=vmSuperAwesomeSlideshow'
			},
			bindToController: true
		};
	});
	app.controller('VmSuperAwesomeSlideshowController', function($timeout){
		var self = this,
			currIndex = null
		;
		self.currentImage = null;
		
		function showImage(n){
			self.currentImage = self.images[n];
			currIndex = n;
		}
		
		function showNext(auto){
			var n = currIndex + 1;
			if(currIndex === null || n >= self.images.length) { n = 0; }
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
