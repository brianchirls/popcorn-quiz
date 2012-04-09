(function (Popcorn) {

"use strict";

	var styleSheet;

	Popcorn.basePlugin( 'answer' , function(options, base) {
		var popcorn = this,
			media = popcorn.media,
			selector = '', elements;

		if (!options.target) {
			return;
		}

		if (options.question === undefined || isNaN(options.question) || options.question < 0) {
			return;
		}

		if (!styleSheet) {
			styleSheet = document.createElement('style');
			styleSheet.setAttribute('type', 'text/css');
			styleSheet.appendChild(
				document.createTextNode(
					'.popcorn-quiz-answer.highlight { background-color: yellow; }\n'
				)
			);
			document.head.appendChild(styleSheet);
		}

		if (options.target.id) {
			selector = '#' + options.target.id + ' ';
		}

		selector += '.popcorn-quiz.active .answer-' + options.question;

		return {
			start: function( event, options ) {
				var i;
				elements = document.querySelectorAll(selector);
				for (i = 0; i < elements.length; i++) {
					base.addClass(elements[i], ['highlight', 'revealed']);
				}
			},
			frame: function( event, options, time ) {
			},
			end: function( event, options ) {
				var i, rewind;

				if (!elements) {
					return;
				}

				rewind = (popcorn.currentTime() < options.start);

				for (i = 0; i < elements.length; i++) {
					base.removeClass(elements[i], 'highlight');
					if (rewind) {
						base.removeClass(elements[i], 'revealed');
					}
				}
			},
			_teardown: function( options ) {
			}
		};
	});
})( Popcorn );
