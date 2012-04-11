(function (Popcorn, window) {

	"use strict";

	var styleSheet,
		console = window.console,
		sounds = {},
		isiPad = navigator.userAgent.match(/iPad/i),
		gonnaClean = false;

	/*
	djb2 hash function for indexing combined audio file paths
	http://www.cse.yorku.ca/~oz/hash.html
	*/
	function hash(s) {
		var i, c, h = 5381;
		for (i = 0; i < s.length; i++) {
			c = s.charCodeAt(i);
			h = ((h << 5) + h) + c; /* hash * 33 + c */
		}
		return h;
	}

	/*
	Only keep one copy of each set of sounds. It's a pretty safe bet that we'll only need one at a time.
	This will delete sounds we don't need anymore, but since Butter will delete and re-create
	similar events many times in quick succession, we hold on to them for a few seconds in case
	we need them again soon.
	*/
	function cleanUpSounds() {

		function doClean() {
			var i;

			for (i in sounds) {
				if (sounds.hasOwnProperty(i) && !sounds[i].count) {
					console.log('Unloading sounds \n' + sounds[i].urls.join('\n'));
					delete sounds[i];
				}
			}
			gonnaClean = false;
		}

		if (!gonnaClean) {
			gonnaClean = true;
			setTimeout(doClean, 10000);
		}
	}

	Popcorn.basePlugin( 'quiz' , function(options, base) {
		var popcorn = this,
			media = popcorn.media,
			guid,
			i, ul, li, answer, answers,
			question,
			button,
			element,
			explanation,
			rightSound, wrongSound,
			allowPause = false;

		function loadSounds() {
			var name, sound, i, rewind;

			function loadSound(urls) {
				var obj, h, source;

				h = hash(urls.join('\n'));
				obj = sounds[h];
				if (obj) {
					obj.count++;
					return obj;
				}

				obj = {
					count: 1,
					hash: h,
					urls: urls.slice(0)
				};
				obj.audio = document.createElement('audio');
				obj.audio.preload = true;
				obj.audio.addEventListener('ended', rewind, false);
				for (i = 0; i < urls.length; i++) {
					source = document.createElement('source');
					source.src = urls[i];
					obj.audio.appendChild(source);
				}

				sounds[h] = obj;
				return obj;
			}

			//No sounds in iPad because it can't handle two html5 media elements at once
			if (isiPad) {
				return;
			}

			rewind = function() {
				this.pause();
				this.currentTime = 0;
			};

			rightSound = loadSound(rightSound);
			wrongSound = loadSound(wrongSound);
		}

		function proceed() {
			var endTime = options.end - 0.1;
			if (popcorn.currentTime() < endTime) {
				popcorn.currentTime(endTime);
			}
			popcorn.play();
		}

		function clickAnswer(i) {
			var status, sound;

			if (answer >= 0) {
				//don't re-answer this until reset
				return;
			}

			popcorn.pause();
			allowPause = false;

			answer = i;
			options.answer = i;

			base.addClass(answers[i].label.parentNode, 'answered');
			if (base.options.correct === i) {
				status = 'right';
				sound = rightSound;
			} else {
				status = 'wrong';
				sound = wrongSound;
			}

			base.addClass(base.container, status);
			if (sound && sound.audio && sound.audio.readyState) {
				sound.audio.play();
			}

			if (typeof options.onAnswer === 'function') {
				if (Popcorn.plugin.debug) {
					options.onAnswer.call(base, options);
				} else {
					try {
						options.onAnswer.call(base, options, answer);
					} catch (e) {
						console.log('Error in quiz onAnswer event:' + e.message);
					}
				}
			}
		}

		if (!options.question || !options.target || !options.answers) {
			return;
		}

		//clone answers array to be safe
		if (Object.prototype.toString.call(options.answers) === '[object Array]') {
			answers = options.answers.slice(0);
		} else {
			answers = base.toArray(options.answers, /\n\r/);
		}

		if (!answers || !answers.length) {
			return;
		}

		rightSound = base.toArray(options.rightSound);
		if (!rightSound || !rightSound.length) {
			rightSound = [
				'audio/ding.mp3',
				'audio/ding.ogg'
			];
		}

		wrongSound = base.toArray(options.wrongSound);
		if (!wrongSound || !wrongSound.length) {
			wrongSound = [
				'audio/buzzer.mp3',
				'audio/buzzer.ogg'
			];
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
		button.appendChild(document.createTextNode('Continue >>'));
		button.addEventListener('click', proceed);
		element.appendChild(button);

		base.container.appendChild(element);

		return {
			start: function( event, options ) {
				base.addClass(base.container, 'active');
				allowPause = true;
			},
			frame: function( event, options, time ) {
				if (allowPause && (base.options.end - time <= 0.1)) {
					popcorn.pause();
				}
			},
			end: function( event, options ) {
				var i;
				base.removeClass(base.container, 'active');

				if (popcorn.currentTime() < options.start) {
					for (i = 0; i < answers.length; i++) {
						base.removeClass(answers[i].label.parentNode, 'answered');
						answers[i].input.checked = false;
					}
					answer = -1;
					base.removeClass(base.container, ['right', 'wrong']);
				}
			},
			_teardown: function( options ) {
				if (rightSound) {
					rightSound.count--;
				}
				if (wrongSound) {
					wrongSound.count--;
				}
				cleanUpSounds();

				if (base.container && base.container.parentNode) {
					base.container.parentNode.removeChild(base.container);
				}
			}
		};
	}, { //manifest
		about: {
			name: "Popcorn Quiz Plugin",
			version: "0.1",
			author: "Brian Chirls, @bchirls",
			website: "http://github.com/brianchirls"
		},
		options: {
			question: {
				elem: "input",
				type: "textarea",
				label: "Question"
			},
			explanation: {
				elem: "input",
				type: "textarea",
				label: "Explanation"
			},
			answers: {
				elem: "input",
				type: "textarea",
				label: "Answers"
			},
			correct: {
				elem: "input",
				type: "number",
				label: "Correct Answer"
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
})( Popcorn, window );
