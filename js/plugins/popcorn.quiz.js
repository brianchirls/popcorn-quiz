(function (Popcorn, window) {

"use strict";

	var styleSheet,
		console = window.console,
		sounds,
		isiPad = navigator.userAgent.match(/iPad/i);

	Popcorn.basePlugin( 'quiz' , function(options, base) {
		var popcorn = this,
			media = popcorn.media,
			guid,
			i, ul, li, answer, answers,
			question,
			button,
			element,
			explanation;

		function loadSounds() {
			var name, sound, i, obj, source, rewind;

			if (sounds || isiPad) {
				//already started loading
				return;
			}

			rewind = function() {
				this.currentTime = 0;
			};

			sounds = {
				right: {
					urls: [
						'audio/ding.mp4',
						'audio/ding.ogg'
					]
				},
				wrong: {
					urls: [
						'audio/buzzer.mp4',
						'audio/buzzer.ogg'
					]
				}
			};

			for (name in sounds) {
				obj = sounds[name];
				obj.audio = document.createElement('audio');
				obj.audio.preload = true;
				obj.audio.addEventListener('ended', rewind, false);
				for (i = 0; i < obj.urls.length; i++) {
					source = document.createElement('source');
					source.src = obj.urls[i];
					obj.audio.appendChild(source);
				}
			}
		}

		function proceed() {
			var endTime = options.end - 0.1;
			if (popcorn.currentTime() < endTime) {
				popcorn.currentTime(endTime);
			}
			popcorn.play();
		}

		function clickAnswer(i) {
			var status;

			if (answer >= 0) {
				//don't re-answer this until reset
				return;
			}

			popcorn.pause();

			answer = i;
			options.answer = i;

			base.addClass(answers[i].label.parentNode, 'answered');
			if (base.options.correct === i) {
				status = 'right';
				options.correct = true;
			} else {
				status = 'wrong';
				options.correct = false;
			}

			base.addClass(base.container, status);
			if (sounds && sounds[status] && sounds[status].audio && sounds[status].audio.networkState > 0) {
				sounds[status].audio.play();
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

		if (!options.question || !options.target || !options.answers) {
			return;
		}

		answers = base.toArray(options.answers, /\n\r/);

		if (!answers || !answers.length) {
			return;
		}

		loadSounds();

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

		element = document.createElement('div');
		base.addClass(element, 'popcorn-quiz-explanation');

		if (options.explanation) {
			explanation = document.createElement('div');
			explanation.innerHTML = options.explanation;
			element.appendChild(explanation);
		}

		button = document.createElement('button');
		button.appendChild(document.createTextNode('Next Question >>'));
		button.addEventListener('click', proceed);
		element.appendChild(button);

		base.container.appendChild(element);

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
