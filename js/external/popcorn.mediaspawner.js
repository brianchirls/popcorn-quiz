// PLUGIN: mediaspawner

/**
  * mediaspawner Popcorn Plugin.
  * Adds Video/Audio to the page using Popcorns players
  * Start is the time that you want this plug-in to execute
  * End is the time that you want this plug-in to stop executing
  *
  * @param {Object} options
  *
  * Example:
    var p = Popcorn('#video')
      .mediaspawner( {
        mediaType: "youtube",
        mediaSource: "http://www.youtube.com/watch?v=bUB1L3zGVvc",
        target: "tumblrdiv",
        start: 1,
        end: 10,
        caption: "This is a test. We are assuming conrol. We are assuming control." 
      })
  *
  */

(function( Popcorn, global ) {

  var processMedia = {
    youtube: function( options ) {
      var target = document.getElementById( options.target );
      if ( !Popcorn.youtube ){
        Popcorn.getScript( "http://popcornjs.org/code/players/youtube/popcorn.youtube.js", function() {
          var script = document.createElement( "script" );
          script.src = "http://popcornjs.org/code/players/youtube/popcorn.youtube.js";
          document.head.appendChild( script );

          options.popcorn = Popcorn.youtube( "#" + options._container.id, options.mediaSource );
          options._container.style.display = "none";
          target && target.appendChild( options._container );
        });
      }
      else {
        options.popcorn = Popcorn.youtube( "#" + options._container.id, options.mediaSource );
        options._container.style.display = "none";
        target && target.appendChild( options._container );
      }
    },
    vimeo: function( options ){
      var target = document.getElementById( options.target );
      if ( !Popcorn.vimeo ){
        Popcorn.getScript( "http://popcornjs.org/code/players/vimeo/popcorn.vimeo.js", function() {
          var script = document.createElement( "script" );
          script.src = "http://popcornjs.org/code/players/vimeo/popcorn.vimeo.js";
          document.head.appendChild( script );

          options.popcorn = Popcorn.vimeo( options._container.id, options.mediaSource );
          options._container.style.display = "none";
          target && target.appendChild( options._container ); 
        });
      }
      else {
        options.popcorn = Popcorn.vimeo( options._container.id, options.mediaSource );
        options._container.style.display = "none";
        target && target.appendChild( options._container );
      }
    },
    soundcloud: function( options ){
      var target = document.getElementById( options.target );
      if ( !Popcorn.soundcloud ){
        Popcorn.getScript( "http://popcornjs.org/code/players/soundcloud/popcorn.soundcloud.js", function() {
          var script = document.createElement( "script" );
          script.src = "http://popcornjs.org/code/players/soundcloud/popcorn.soundcloud.js";
          document.head.appendChild( script );

          options.popcorn = Popcorn.soundcloud( options._container.id, options.mediaSource );
          options._container.style.display = "none";
          target && target.appendChild( options._container );
        });
      }
      else {
        options.popcorn = Popcorn.soundcloud( options._container.id, options.mediaSource );
        options._container.style.display = "none";
        target && target.appendChild( options._container );
      }
    },
    video: function( options ){
      var video = document.createElement( "video" ),
          src,
          target = document.getElementById( options.target ),
          info,
          thing;

      video.poster = options.video.poster;
      video.controls = options.video.controls;
      thing = options.video.source;

      for( info in thing ){
        src = document.createElement( "source" );
        src.id = thing[ info ].id;
        src.src = thing[ info ].src;
        src.type = thing[ info ].type;
        src.codecs = thing[ info ].codecs;

        video.appendChild( src );
      }

      options._container.appendChild( video );
      options._container.style.display = "none";
      target && target.appendChild( options._container );
    },
    audio: function( options ){
      var audio = document.createElement( "audio" ),
          src,
          target = document.getElementById( options.target ),
          info,
          thing;

      audio.controls = options.audio.controls;
      thing = options.audio.source;
      
      for( info in thing ){
        src = document.createElement( "source" );
        src.src = thing[ info ].src;
        src.type = thing[ info ].type;

        audio.appendChild( src );
      }

      options._container.appendChild( audio );
      options._container.style.display = "none";
      target && target.appendChild( options._container );
    }
  };

  Popcorn.plugin( "mediaspawner" , {
    manifest: {
      about: {
        name: "Popcorn Media Spawner Plugin",
        version: "0.1",
        author: "Matthew Schranz, @mjschranz",
        website: "mschranz.wordpress.com"
      },
      options: {
        mediaType: {
          elem: "select",
          options: [ "YOUTUBE", "VIMEO", "SOUNDCLOUD", "VIDEO", "AUDIO"],
          label: "Media Type:"
        },
        /*
         * mediaSource is only used with Youtube/Vimeo/Soundcloud.
         */
        mediaSource: {
          elem: "input",
          type: "text",
          label: "Media Source:"
        },
        caption: {
          elem: "input",
          type: "text",
          label: "Media Caption:"
        },
        target: "tumblr-container",
        start: {
          elem: "input",
          type: "number",
          label: "Start_Time"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End_Time"
        },
        video: {
          elem: "input",
          type: "Idontknowwhattocall",
          label: "Video JSON Blob"
        },
        audio: {
          elem: "input",
          type: "Idontknowwhattocall",
          label: "Audio JSON Blob"
        }
      }
    },
    _setup: function( options ) {
      var target = document.getElementById( options.target ),
          validType,
          caption = options.caption || "",
          pop;

      // Valid types of retrieval requests
      validType = function( type ) {
        return ( [ "youtube", "vimeo", "soundcloud", "video", "audio" ].indexOf( type ) > -1 );
      };

      // Lowercase the types incase user enters it in another way
      options.mediaType = options.mediaType.toLowerCase();

      !validType( options.mediaType ) && Popcorn.error( "Invalid Media Type.");

      // Check if mediaSource is passed and mediaType is NOT audio/video
      ( !options.mediaSource && ( options.mediaType === "youtube" || options.mediaType === "vimeo" || options.mediaType === "soundcloud" ) ) && Popcorn.error( "Error. MediaSource must be specified for all types except HTML5 video and audio." );

      // Check if target container exists
      ( !target && Popcorn.plugin.debug ) && Popcorn.error( "Target MediaSpawner container doesn't exist." );

      // Check if video exists in options if mediaType is video
      ( !options.video && options.mediaType === "video" ) && Popcorn.error( "Must provide video option when using HTML5 Video.");

      // Check if audio exists in options if mediaType is audio
      ( !options.audio && options.mediaType === "audio" ) && Popcorn.error( "Must provide audio option when using HTML5 Audio.");

      // Create seperate container for plugin
      options._container = document.createElement( "div" );
      options._container.id = "mediaSpawnerdiv-" + Popcorn.guid();
      options._container.innerHTML = caption + "<br/>";
      
      document.body.appendChild( options._container );
      processMedia[ options.mediaType ]( options );
    },
    start: function( event, options ){
      if ( options._container ) {
        options._container.style.display = "";
      }
    },
    end: function( event, options ){
      var t;
      if( options._container ){
        options._container.style.display = "none";
      }

      // Get reference to Audio/Video element if this is the media type. Pause it on end.
      if( options.mediaType === "video" ){
        t = options._container.getElementsByTagName( "video" )[ 0 ];
        t.pause();
      }
      else if( options.mediaType === "audio" ){
        t = options._container.getElementsByTagName( "audio" )[ 0 ];
        t.pause();
      }
    },
    _teardown: function( options ){
      options.popcorn.destory && options.popcorn.destroy();
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})( Popcorn, this );
