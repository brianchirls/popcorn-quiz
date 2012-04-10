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
        source: "http://www.youtube.com/watch?v=bUB1L3zGVvc",
        target: "mediaspawnerdiv",
        start: 1,
        end: 10,
        caption: "This is a test. We are assuming conrol. We are assuming control."
      })
  *
  */
( function ( Popcorn, global ) {
  var PLAYER_URL = "http://popcornjs.org/code/modules/player/popcorn.player.js",
    urlRegex = /(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu|vimeo|soundcloud)/,
    youtubeScript, vimeoScript, soundcloudScript, playerModuleScript;

  youtubeScript = vimeoScript = soundcloudScript = playerModuleScript = false;

  var setPlayerTypeLoaded = {
    vimeo: function ( ) {
      vimeoScript = true;
    },
    soundcloud: function ( ) {
      soundcloudScript = true;
    },
    youtube: function ( ) {
      youtubeScript = true;
    }
  };

  var isPlayerTypeLoaded = {
    vimeo: function ( ) {
      return vimeoScript;
    },
    soundcloud: function ( ) {
      return soundcloudScript;
    },
    youtube: function ( ) {
      return youtubeScript;
    }
  }

  function addScript( url ) {
    var script = document.createElement( "script" );
    script.src = url;
    document.head.appendChild( script );
  }

  Popcorn.plugin( "mediaspawner", {
    manifest: {
      about: {
        name: "Popcorn Media Spawner Plugin",
        version: "0.1",
        author: "Matthew Schranz, @mjschranz",
        website: "mschranz.wordpress.com"
      },
      options: {
        source: {
          elem: "input",
          type: "text",
          label: "Media Source:"
        },
        caption: {
          elem: "input",
          type: "text",
          label: "Media Caption:"
        },
        target: "mediaspawner-container",
        start: {
          elem: "input",
          type: "number",
          label: "Start_Time"
        },
        end: {
          elem: "input",
          type: "number",
          label: "End_Time"
        }
      }
    },
    _setup: function ( options ) {
      var target = document.getElementById( options.target ),
          caption = options.caption || "",
          mediaType;

      // Check if mediaSource is passed and mediaType is NOT audio/video
      !options.source && Popcorn.error( "Error. Source must be specified." );

      // Check if target container exists
      ( !target && Popcorn.plugin.debug ) && Popcorn.error( "Target MediaSpawner container doesn't exist." );

      // Create seperate container for plugin
      options._container = document.createElement( "div" );
      options._container.id = "mediaSpawnerdiv-" + Popcorn.guid( );
      options._container.innerHTML = caption;
      document.body.appendChild( options._container );
      options._container.style.display = "none";
      target && target.appendChild( options._container );

      // Change target reference to the id of the new container we created
      target = options._container.id;

      function findMediaType( url ) {
        var regexResult = urlRegex.exec( url );
        if ( regexResult ) {
          mediaType = regexResult[ 1 ];
        } else {
          mediaType = "object";
        }
      }
      findMediaType( options.source );

      // Store Reference to Type for use in end
      options.type = mediaType;

      function flashCallback( type ) {
        var script;

        // our regex only handles youtu ( incase the url looks something like youtu.be )
        if ( type === "youtu" ) {
          type = "youtube";
        }

        if ( !window.Popcorn[ type ] && !isPlayerTypeLoaded[ type ]( ) ) {
          script = document.createElement( "script" );
          script.src = "http://popcornjs.org/code/players/" + type + "/popcorn." + type + ".js";
          document.head.appendChild( script );
          setPlayerTypeLoaded[ type ]( );
        }

        // If player type script needed to be loaded, keep checking that is has before calling
        // Popcorn.smart
        function checkPlayerTypeLoaded( ) {
          if ( !window.Popcorn[ type ] ) {
            checkPlayerTypeLoaded( );
          } else {
            options.popcorn = Popcorn.smart( "#" + target, options.source );
          }
        }

        setTimeout( checkPlayerTypeLoaded, 300 );
      }

      function html5CallBack( ) {
        if( options.source.type === "video" ) {
          var video = document.createElement( "video" ),
              src,
              info,
              mimeType;

          video.poster = options.source.poster;
          video.controls = options.source.controls;
          mimeType = options.source.sources;

          for( info in mimeType ) {
            src = document.createElement( "source" );
            src.id = mimeType[ info ].id;
            src.src = mimeType[ info ].src;
            src.type = mimeType[ info ].type;
            src.codecs = mimeType[ info ].codecs;

            video.appendChild( src );
          }

          options._container.appendChild( video );
        }
        else {
          var audio = document.createElement( "audio" ),
              src,
              info,
              mimeType;

          audio.controls = options.source.controls;
          mimeType = options.source.sources;
      
          for( info in mimeType ) {
            src = document.createElement( "source" );
            src.src = mimeType[ info ].src;
            src.type = mimeType[ info ].type;

            audio.appendChild( src );
          }

          options._container.appendChild( audio );
        }
      }

      // If Player script needed to be loaded, keep checking until it is and then fire readycallback
      function isPlayerReady( ) {
        if ( !window.Popcorn.player ) {
          setTimeout( function ( ) {
            isPlayerReady( );
          }, 300 );
        } else {
          playerModuleScript = true;
          if( mediaType !== "object" ) {
            flashCallback( mediaType );
          }
          else {
            html5CallBack( );
          }
        }
      }

      // If player script isn't present, retrieve script
      if ( !window.Popcorn.player && !playerModuleScript ) {
        addScript( PLAYER_URL );
        isPlayerReady( );
      } else {
        if( mediaType !== "object" ) {
          flashCallback( mediaType );
        }
        else {
          html5CallBack( );
        }
      }

    },
    start: function ( event, options ) {
      if (options._container) {
        options._container.style.display = "";
      }
    },
    end: function ( event, options ) {
      if ( options._container ) {
        options._container.style.display = "none";
      }

      if ( options.type === "object" ) {
        var media;

        if( options.source.type === "video" ) {
          media = options._container.getElementsByTagName( "video" )[ 0 ];
          media.pause( );
        }
        else if( options.source.type === "audio" ) {
          media = options._container.getElementsByTagName( "audio" )[ 0 ];
          media.pause( );
        }
      }
    },
    _teardown: function ( options ) {
      options.popcorn && options.popcorn.destory && options.popcorn.destroy( );
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._container );
    }
  });
})(Popcorn, this);