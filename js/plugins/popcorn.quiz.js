(function (Popcorn) {

"use strict";

	Popcorn.basePlugin( 'quiz' , function(options, base) {
		var popcorn = this,
			media = popcorn.media;

		return {
			start: function( event, options ) {
			},
			frame: function( event, options, time ) {
				if (base.options.end - time <= 0.1) {
					popcorn.pause();
				}
			},
			end: function( event, options ) {
			},
			_teardown: function( options ) {
			}
		};
	});
})( Popcorn );
