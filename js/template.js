document.addEventListener( "DOMContentLoaded", function( e ){

  Popcorn.plugin.debug = true;

  Butter({
    config: "quiz.conf",
    ready: function( butter ){
      var playbutton, playing = false,
        media = butter.media[ 0 ];

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

        function setupQuiz(options) {
          if (this.container) {
            this.container.setAttribute('data-butter-exclude', 'true');
          }
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

        track = media.addTrack( "Questions" );
        media.addTrack( "Answers" );
        popcorn = media.popcorn.popcorn;

        popcorn.on('play', function() {
          playing = true;
          playbutton.className = 'playing';
          playbutton.style.visibility = 'visible';
        });

        popcorn.on('pause', function() {
          if (playing) {
            playbutton.style.visibility = 'hidden';
          }
        });

        playbutton = document.getElementById('playpause');
        playbutton.addEventListener('click', function() {
          if (playing) {
            if (!popcorn.paused()) {
              playing = false;
              popcorn.pause();
              playbutton.className = '';
            }
            return;
          }

          popcorn.play();
        }, false);

        /*
        tell quiz-answers editor what questions are available
        */
        window.addEventListener('message', function(e) {
          var start, end, events, event, answers = [], i, j;
          if (typeof e.data === 'object' && e.data.msg === 'request-quiz-answers') {
            start = e.data.start;
            end = e.data.end;
            if (popcorn && popcorn.data && popcorn.data.trackEvents) {
              events = popcorn.data.trackEvents.byStart.filter(function(evt) {
                return evt._natives && evt._natives.type === 'quiz' &&
                  evt.start <= end && evt.end > start;
              });

              for (i = 0; i < events.length; i++) {
                event = events[i];
                if (event.answers) {
                  for (j = 0; j < event.answers.length; j++) {
                    answers.push({
                      i: j,
                      answer: event.answers[j]
                    });
                  }
                }
              }

              e.source.postMessage({
                msg: 'response-quiz-answers',
                answers: answers
              }, '*');
            }
          }
        }, false);

        popcorn.defaults('quiz', {
          onSetup: setupQuiz,
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
            answer: 0
          }
        });

        butter.tracks[ 1 ].addTrackEvent({
          type: "answer",
          popcornOptions: {
            start: 12.38,
            end: 13.512,
            target: 'questions',
            answer: 1
          }
        });

        butter.tracks[ 1 ].addTrackEvent({
          type: "answer",
          popcornOptions: {
            start: 13.588,
            end: 14.504,
            target: 'questions',
            answer: 2
          }
        });

        butter.tracks[ 1 ].addTrackEvent({
          type: "answer",
          popcornOptions: {
            start: 14.637,
            end: 15.924,
            target: 'questions',
            answer: 3
          }
        });

        butter.tracks[ 0 ].addTrackEvent({
          type: "quiz",
          popcornOptions: {
            start: 16.05,
            end: 22.833,
            target: 'questions',
            question: 'Which welder appeared in a Newt Gingrich ad?',
            answers: [
              'Left',
              'Right'
            ],
            correct: 0,
            explanation: 'Explanation goes here.'
          }
        });

      }

      media.onReady( start );
      
      window.butter = butter;
    }
  }); //Butter
}, false );
