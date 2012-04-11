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

		if (options.answer === undefined || isNaN(options.answer) || options.answer < 0) {
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

		selector += '.popcorn-quiz.active .answer-' + options.answer;

		return {
			start: function( event, options ) {
				var i;
				elements = document.querySelectorAll(selector);
				for (i = 0; i < elements.length; i++) {
					base.addClass(elements[i], ['highlight', 'revealed']);
				}
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
			}
			//_teardown isn't necessary hear, since we didn't actually add anything
		};
	}, { //manifest
		about: {
			name: "Popcorn Quiz Answer Plugin",
			version: "0.1",
			author: "Brian Chirls, @bchirls",
			website: "http://github.com/brianchirls"
		},
		options: {
			answer: {
				elem: "input",
				type: "number",
				label: "Answer"
			},
			target: "questions",
			start: {
				elem: "input",
				type: "number",
				label: "Start Time"
			},
			end: {
				elem: "input",
				type: "number",
				label: "End Time"
			}
		}
	});
})( Popcorn );
