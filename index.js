/**
 *
 **/
var port    	= 3000,
	express 	= require('express'),
	app 		= express(),
	path 		= require('path'),
	server 		= require('http').Server(app),
	io 			= require('socket.io')(server),
	lame 		= require('lame'),
	speaker 	= require('speaker'),
	spotify 	= require('spotify-web'),
	path 		= require('path'),
	xml2js 		= require('xml2js'),

	// persistent datastore with manual loading
	datastore 	= require('nedb'), 
	databases 	= {},

	// stream instances
	stream, 
	playing  	= false,
	stopping 	= false,

	redirect_url = '';

/**
 * Databases 
 **/
databases.zones = new datastore({ filename: 'db/zones', autoload: true }),
databases.auth 	= new datastore({ filename: 'db/auth', autoload: true }),

app.use(express.static(path.join(__dirname, 'public')));

server.listen(port);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {

	console.log('A new client connected', socket.id);

	function sendZones () {

		// all clients get alerted
		databases.zones.find({}, function(err, rooms) {
			io.emit('rooms:updated', rooms);	
		});
	}

	function spotifyEnabled (callback) {

		var authorized = databases.auth.findOne({}, callback);
	}

	function showError (message, config) {

		//
		socket.emit('error:generic', {
			message: message,
			config: config || {}
		})
	}

	socket.emit('config:init', {
		redirect: redirect_url
	});

	// 
	socket.on('room:add', function (room) {

		//
		databases.zones.insert({name: room}, function (err, doc) {
			sendZones();
		});
	});

	socket.on('room:remove', function (id) {

		//
		databases.zones.remove({_id: id}, function (err) {
			sendZones();
		});
	});

	socket.on('search:generic', function(searchObj) {

		spotify.login(username, password, function (err, spotify) {

			if (err) {
				console.error(err);

			} else {
				
				console.log('Generic search', searchObj.term);

				// fire the search off - results returned as XML so pase it into JSON
				spotify.search(searchObj.term, function(err, response) {

					var parseString = xml2js.parseString;
					
					parseString(response, function (err, result) {

						result = result.result;

						socket.emit('search:results', {
							artists: 	result.artists,
							albums: 	result.albums,
							tracks: 	result.tracks,
							playlists: 	result.playlists
						});

						spotify.disconnect();
					});
				});
			}
		});
	});



	socket.on('search:spotify', function(uri) {

		var type = spotify.uriType(uri.term);
		// console.log('spotify uri', uri, type);
		// first get a "Album" instance from the album URI
		// spotify.get(uri, function (err, album) {
		// 	if (err) throw err;

		// 	// first get the Track instances for each disc
		// 	var tracks = [];
		// 	album.disc.forEach(function (disc) {
		// 		if (!Array.isArray(disc.track)) return;
		// 		tracks.push.apply(tracks, disc.track);
		// 	});

		// 	console.log(tracks.map(function(t){ return t.uri; }));

		// 	function next () {

		// 		var track = tracks.shift();

		// 		if (!track) return spotify.disconnect();

		// 		track.get(function (err) {

		// 			if (err) throw err;

		// 			console.log('Playing: %s - %s', track.artist[0].name, track.name);

		// 			track.play()
		// 				.on('error', function (err) {
		// 				console.error(err.stack || err);
		// 				next();
		// 			})
		// 			.pipe(new lame.Decoder())
		// 			.pipe(new Speaker())
		// 			.on('finish', next);
		// 		});
		// 	}
		// 	next();

		// });
	});


	socket.on('track:play', function(track) {
		
		console.log("playing");

		var uri = track || 'spotify:track:6tdp8sdXrXlPV6AZZN2PE8';

		spotify.login(username, password, function (err, spotify) {

			if (err) throw err;

			// first get a "Track" instance from the track URI
			spotify.get(uri, function (err, track) {

				if (err) {

					console.log('Error playing');

				} else {

					console.log('Playing: %s - %s', track.artist[0].name, track.name);

					// play() returns a readable stream of MP3 audio data
					track.play()
					.pipe(new lame.Decoder())
					.pipe(new speaker())
					.on('finish', function () {
						spotify.disconnect();
					});
				}
			});
		});
	});

	spotifyEnabled(function(err, credentials) {

		if (!err && credentials) {
			// send rooms initially
			sendZones();
		} else {
			//
			showError("Application has no credentials. Click OK to setup your Spotify account.", {
				callback: 'spotify:auth',
				type: 'spotify:unauthed' 
			});
		}
	});	
});

// 



// spotifyClient.get(data.uri, function (err, track) {
// 	    if (err) throw err;
// 	    console.log('playing %s', track.name);
// 	    io.emit("is:playing", {
// 	    	artist: track.artist[0].name,
// 	    	name: track.name,
// 	    	album: track.album
// 	    });
// 	    stream = track.play();
// 	    stream
// 	    	.pipe(lame)
// 	    	.pipe(speaker)
// 	    	.on('finish', function () {
// 	        	console.log("finished");
// 		        lame.unpipe(speaker);
// 		        speaker.end();
// 		        stopping = false;
// 		        playing = false;
// 	      });
//   	});
// });












// var app = require('express')();
// // var server = require('http').Server(app);
// var io = require('socket.io')(server);
// var http = require('http').Server(app);
// var lame = require('lame');
// var Speaker = require('speaker');
// var Spotify = require('spotify-web');
// var path = require('path');
// var uri = 'spotify:track:6pIZ0u32c2Lku8PmCWtnMy';//process.argv[2] || 'spotify:track:6tdp8sdXrXlPV6AZZN2PE8';

// app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function(req, res){
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.listen(3000);

// var spotifyClient, stream, playing = false, stopping = false;

// var lame = new lame.Decoder();
// var speaker = new Speaker();

// Spotify.login(username, password, function (err, spotify) {

//   if (err) throw err;

//   spotifyClient = spotify;
// });

// var serveStatic = require('serve-static');

// app.get('/', function(req, res){
//   res.sendFile('index.html');
// });

// io.on('connection', function(socket){

//   console.log('a new user connected');

//   	socket.on('stop:me', function () {

//   		if (playing) {
//   			if (stream) {
// 		  		try {
// 		  			stream.abort();	
// 		  		} catch (e) {
// 		  			console.error(e);
// 		  		}
// 		  	}
//   		}

//   		console.log('stopping...');
//   		stopping = true;

//   		if (stream) {
// 	  		try {
// 	  			stream.abort();
// 	  		} catch (e) {
// 	  			console.error(e);
// 	  		}
// 	  	}
//   	});

// 	socket.on('play:me', function(data) {

// 		if (stopping) {
// 			console.log("still stopping..");
// 			return;
// 		}

// 	  	console.log("playing...", data);
// 	  	playing = true;

// 	  	if (stream) {
// 	  		try {
// 	  			stream.abort();	
// 	  		} catch (e) {
// 	  			console.error(e);
// 	  		}
// 	  	}

// 	  	spotifyClient.get(data.uri, function (err, track) {

// 		    if (err) throw err;

// 		    console.log('playing %s', track.name);

// 		    io.emit("is:playing", {
// 		    	artist: track.artist[0].name,
// 		    	name: track.name,
// 		    	album: track.album
// 		    });

// 		    stream = track.play();

// 		    stream
// 		    	.pipe(lame)
// 		    	.pipe(speaker)
// 		    	.on('finish', function () {
// 		        	console.log("finished");
// 			        lame.unpipe(speaker);
// 			        speaker.end();
// 			        stopping = false;
// 			        playing = false;
// 		      });
// 	  	});
//   	});

// });


// http.listen(3000, function(){
//   console.log('server is listening on *:3000');
// });
