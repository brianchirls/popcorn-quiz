(function (Popcorn, window) {

"use strict";

	var styleSheet,
		console = window.console;

	Popcorn.basePlugin( 'quiz' , function(options, base) {
		var popcorn = this,
			media = popcorn.media,
			guid,
			i, ul, li, answer, answers,
			question,
			explanation;

		function clickAnswer(i) {
			if (answer >= 0) {
				//don't re-answer this until reset
				return;
			}

			answer = i;
			options.answer = i;

			base.addClass(answers[i].label.parentNode, 'answered');
			if (base.options.correct === i) {
				base.addClass(base.container, 'right');
				options.correct = true;
			} else {
				base.addClass(base.container, 'wrong');
				options.correct = false;
			}

			if (typeof options.onAnswer === 'function') {
				if (Popcorn.plugin.debug) {
					options.onAnswer(options);
				} else {
					try {
						options.onAnswer(options);
					} catch (e) {
						console.log('Error in quiz onAnswer event:' + e.message);
					}
				}
			}
		}

		function proceed() {
			popcorn.play();
		}

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
					'.popcorn-quiz > .popcorn-quiz-explanation { display: none; }\n' +
					'.popcorn-quiz.right > .popcorn-quiz-explanation, .popcorn-quiz.wrong > .popcorn-quiz-explanation { display: block; }\n' +
					'.popcorn-quiz > ul { list-style: none; }\n' +
					'.popcorn-quiz-answer { cursor: pointer; }\n' +
					'.popcorn-quiz-answer > label { cursor: pointer; }\n' +
					'.popcorn-quiz.wrong .popcorn-quiz-answer, .popcorn-quiz.right .popcorn-quiz-answer { color: gray; }\n' +
					'.popcorn-quiz.wrong .popcorn-quiz-answer.answered { text-decoration: line-through; }\n' +
					'.popcorn-quiz.wrong .popcorn-quiz-answer.correct, .popcorn-quiz.right .popcorn-quiz-answer.correct { font-weight: bold; color: darkgreen; }\n' +
					'.popcorn-quiz.active { display: block; }\n'
			));
			document.head.appendChild(styleSheet);
		}

		base.makeContainer();

		question = document.createElement('p');
		base.addClass(question, 'popcorn-quiz-question');
		question.appendChild(document.createTextNode(options.question));
		base.container.appendChild(question);

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

			answer.label.addEventListener('click', (function(i) {
				return function() {
					clickAnswer(i);
				};
			}(i)), false);

			li = document.createElement('li');
			li.appendChild(answer.label);
			base.addClass(li, ['answer-' + i, 'popcorn-quiz-answer']);

			ul.appendChild(li);

			if (i === options.correct) {
				base.addClass(li, 'correct');
			}
		}
		answer = -1;

		if (options.explanation) {
			explanation = document.createElement('div');
			base.addClass(explanation, 'popcorn-quiz-explanation');
			explanation.innerHTML = options.explanation;
			base.container.appendChild(explanation);
		}

		return {
			start: function( event, options ) {
				base.removeClass(base.container, ['right','wrong']);
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
})( Popcorn, window );
