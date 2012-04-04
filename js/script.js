(function () {
	var popcorn = Popcorn('#audio', {
		frameAnimation: true
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

