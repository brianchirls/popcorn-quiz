(function (Popcorn) {

"use strict";

	var styleSheet;

	Popcorn.basePlugin( 'quiz' , function(options, base) {
		var popcorn = this,
			media = popcorn.media,
			guid,
			i, ul, li, answer, answers;

		if (!options.question || !options.target || !options.answers) {
			return;
		}

		answers = base.toArray(options.answers, /\n\r/);

		if (!answers || !answers.length) {
			return;
		}

		guid = 'question-' + Popcorn.guid();

		if (!styleSheet) {
			styleSheet = document.createElement('style');
			styleSheet.setAttribute('type', 'text/css');
			styleSheet.appendChild(
				document.createTextNode(
					'.popcorn-quiz { display: none; }\n' +
					'.popcorn-quiz > ul { list-style: none; }\n' +
					'.popcorn-quiz-answer { cursor: pointer; }\n' +
					'.popcorn-quiz-answer > label { cursor: pointer; }\n' +
					'.popcorn-quiz.active { display: block; }\n'
			));
			document.head.appendChild(styleSheet);
		}

		base.makeContainer();

		//todo: put this in an element for styling
		base.container.appendChild(document.createTextNode(options.question));

		ul = document.createElement('ul');
		base.container.appendChild(ul);

		for (i = 0; i < answers.length; i++) {
			answer = {
				text: answers[i]
			};
			answers[i] = answer;
			answer.label = document.createElement('label');
			answer.input = document.createElement('input');
			answer.input.setAttribute('type', 'radio');
			answer.input.setAttribute('name', guid);

			answer.label.appendChild(answer.input);
			answer.label.appendChild(document.createTextNode(answer.text));

			li = document.createElement('li');
			li.appendChild(answer.label);
			base.addClass(li, ['answer-' + i, 'popcorn-quiz-answer']);

			ul.appendChild(li);
		}

		return {
			start: function( event, options ) {
				base.addClass(base.container, 'active');
			},
			frame: function( event, options, time ) {
				if (base.options.end - time <= 0.1) {
					popcorn.pause();
				}
			},
			end: function( event, options ) {
				base.removeClass(base.container, 'active');
			},
			_teardown: function( options ) {
			}
		};
	});
})( Popcorn );
