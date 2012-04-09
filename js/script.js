(function () {
	Popcorn.plugin.debug = true;

	var popcorn, title, questions = [];

	function setQuestionTitle(options) {
		var i = this.allEvents.indexOf(this);
		if (i >= 0) {
			title.nodeValue = 'Question ' + (i + 1) + ' of ' + this.allEvents.length;
		}
	}

	function clearQuestionTitle() {
		title.nodeValue = '';
	}

	title = document.getElementById('question-title');
	title.appendChild(document.createTextNode(''));
	title = title.childNodes[0];

	popcorn = Popcorn('#audio', {
		frameAnimation: true
	});

	popcorn.defaults('quiz', {
		onStart: setQuestionTitle,
		onEnd: clearQuestionTitle
	});

	popcorn.quiz({
		start: 3,
		end: 16.05,
		target: 'questions',
		question: 'Which symbol has represented American jobs in Republican candidate campaign ads this election year?',
		answers: [
			'the farmer',
			'wheat fields',
			'the welder',
			'American flag'
		],
		correct: 2,
		explanation: 'It\'s the welder, obvi!'
	});

	popcorn.answer({
		start: 11.338,
		end: 12.38,
		target: 'questions',
		question: 0
	});

	popcorn.answer({
		start: 12.38,
		end: 13.512,
		target: 'questions',
		question: 1
	});

	popcorn.answer({
		start: 13.588,
		end: 14.504,
		target: 'questions',
		question: 2
	});

	popcorn.answer({
		start: 14.637,
		end: 15.924,
		target: 'questions',
		question: 3
	});

	popcorn.quiz({
		start: 16.05,
		end: 22.833,
		target: 'questions',
		question: 'Which welder appeard in a Newt Gingrich ad?',
		answers: [
			'Left',
			'Right'
		],
		correct: 0,
		explanation: 'Explanation goes here.'
	});
}());

