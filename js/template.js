document.addEventListener( "DOMContentLoaded", function( e ){

  Popcorn.plugin.debug = true;

  Butter({
    config: "../../quiz.conf",
    ready: function( butter ){
      var media = butter.media[ 0 ];

      function start(){
        var track, popcorn, title, score, questions = [];

        function calculateScore() {
          var i, points = 0, outOf = 0;

          for (i = 0; i < questions.length; i++) {
            q = questions[i];
            if (q !== undefined) {
              outOf++;
              if (q) {
                points++;
              }
            }
          }

          score.nodeValue = 'Score: ' + points + '/' + outOf;
        }

        function startQuiz(options) {
          var i = this.allEvents.indexOf(this);
          if (i >= 0) {
            title.nodeValue = 'Question ' + (i + 1) + ' of ' + this.allEvents.length;
          }
        }

        function endQuiz(options) {
          var i;
          title.nodeValue = '';
          if (this.popcorn.currentTime() < options.start) { //rewind
            i = this.allEvents.indexOf(this);
            if (i >= 0) {
              questions[i] = undefined;
              calculateScore();
            }
          }
        }

        function answerQuiz(options) {
          var q, i;

          i = this.allEvents.indexOf(this);
          if (i >= 0) {
            q = this.allEvents[i];
            questions[i] = (options.correct === options.answer);
          }

          calculateScore();
        }

        title = document.getElementById('question-title');
        if (!title.childNodes.length) {
          title.appendChild(document.createTextNode(''));
        }
        title = title.childNodes[0];

        score = document.getElementById('score');
        if (!score.childNodes.length) {
          score.appendChild(document.createTextNode(''));
        }
        score = score.childNodes[0];

        track = media.addTrack( "Track1" );
        media.addTrack( "Track" + Math.random() );
        popcorn = media.popcorn.popcorn;

        popcorn.defaults('quiz', {
          onStart: startQuiz,
          onEnd: endQuiz,
          onAnswer: answerQuiz
        });

        butter.tracks[ 0 ].addTrackEvent({
          type: "quiz",
          popcornOptions: {
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
          }
        });

        butter.tracks[ 1 ].addTrackEvent({
          type: "answer",
          popcornOptions: {
            start: 11.338,
            end: 12.38,
            target: 'questions',
            question: 0
          }
        });

        butter.tracks[ 1 ].addTrackEvent({
          type: "answer",
          popcornOptions: {
            start: 12.38,
            end: 13.512,
            target: 'questions',
            question: 1
          }
        });

        butter.tracks[ 1 ].addTrackEvent({
          type: "answer",
          popcornOptions: {
            start: 13.588,
            end: 14.504,
            target: 'questions',
            question: 2
          }
        });

        butter.tracks[ 1 ].addTrackEvent({
          type: "answer",
          popcornOptions: {
            start: 14.637,
            end: 15.924,
            target: 'questions',
            question: 3
          }
        });

        butter.tracks[ 0 ].addTrackEvent({
          type: "quiz",
          popcornOptions: {
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
          }
        });


        /*
        var event = track.addTrackEvent({
          type: "text",
          popcornOptions: {
            start: 0,
            end: 3,
            text: "test",
            target: "Area1"
          }
        });

        butter.tracks[ 2 ].addTrackEvent({
          type: "footnote",
          popcornOptions: {
            start: 1,
            end: 2,
            target: "Area2"
          }
        });
      */

      }

      media.onReady( start );
      
      window.butter = butter;
    }
  }); //Butter
}, false );
