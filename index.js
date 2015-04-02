/**
 * 
 * 
 * 
 **/
var spotipi = (function(){

	//
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
		request 	= require('request'), 

		// persistent datastore with manual loading
		datastore 	= require('nedb'), 
		databases 	= {},

		// stream instances
		socket,
		stream, 
		playing  	= false,
		stopping 	= false;


	/**
	 * init
	 **/
	function start () {

		databases.zones = new datastore({ filename: 'db/zones', autoload: true }),
		databases.auth 	= new datastore({ filename: 'db/auth', 	autoload: true }),

		app.use(express.static(path.join(__dirname, 'public')));

		app.get('/', function (req, res) {
			res.sendFile(__dirname + '/index.html');
		});

		server.listen(port);

		io.on('connection', connection);

		require('dns').lookup(require('os').hostname(), function (err, add, fam) {
			console.log('Point a browser to http://' + add + ':' + port);
		});
	}


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
		});
	}

	function getAuthByService(service, callback) {

		var credentials,
			auth;

		databases.auth.findOne({tag: service}, function(err, credentials) {

			if (err) {
				callback(err);
			} else {

				if (credentials && credentials.hasOwnProperty('auth')) {
					auth = credentials.auth;
					callback(null, auth);
				} else {
					callback('Could not find any stored credentials.', null);
				}
			}
		});
	}

	function accountAdd (auth) {

		var encrypted = auth;

		// update or insert new account
		databases.auth.update({ tag: 'spotify' }, { auth: encrypted, tag: 'spotify' }, { upsert: true }, function (err, doc) {

			if (err) {
				//
				showError('Failed to add Spotify details.', {});
			} else {
				sendZones();
			}
		});
	}

	function zoneAdd (zone) {

		databases.zones.insert({name: zone}, function (err, doc) {
			sendZones();
		});
	}

	function zoneRemove (zoneId) {

		databases.zones.remove({_id: zoneId}, function (err) {
			sendZones();
		});
	}


	function searchGeneric (searchObj) {

		//https://api.spotify.com/v1/search?q=oasis&type=track
		var requests 	= 0;
			types  		= ['track', 'artist', 'playlist'],
			lookup 		= {
				uri: 'https://api.spotify.com/v1/search',
				headers: {
					'Accept': 'application/json'
				},
				json: true,
				qs: {
					q: searchObj.term,
					type: false,
					limit: 8,
					offset: 0
				}
			},
			results = {
				artist: [],
				album: [],
				track: [],
				playlist: []
			};

		types.forEach(function(type){

			// set lookup type
			lookup.qs.type = type;

			// do lookup
			request(lookup, function(err, response, body) {

				requests++;

				if (!err) {
					results[type] = body[type + 's'].items;
				}

				if (requests === types.length) {
					try {
						socket.emit('search:results', results);	
					} catch (e) {
						console.error(e);
					}
					
				}
			});

		});
	}

	// searchGeneric({term: 'oasis'});

	function playTrack(uri) {

		// spotify.login('valerie-23', 'zysK3Ed8cEnck9i', function (err, instance) {
				
		// 	  if (err) throw err;

		// 	  // first get a "Track" instance from the track URI
		// 	  instance.get('spotify:track:6tdp8sdXrXlPV6AZZN2PE8', function (err, track) {
		// 	    if (err) throw err;
		// 	    console.log('Playing: %s - %s', track.artist[0].name, track.name);

		// 	    // play() returns a readable stream of MP3 audio data
		// 	    track.play()
		// 	      .pipe(new lame.Decoder())
		// 	      .pipe(new speaker())
		// 	      .on('finish', function () {
		// 	        instance.disconnect();
		// 	      });

		// 	  });
		// 	});

		getAuthByService('spotify', function(err, credentials) {

			spotify.login(credentials.username, credentials.password, function (err, instance) {

				if (err) {

					//
					showError(err.toString(), {});
				} else {

					// first get a "Track" instance from the track URI
					instance.get(uri, function (err, track) {

						if (err) {

							console.error('Error playing %s', err);
							showError(err.toString(), {});

						} else {

							console.log('Playing: %s - %s', track.artist[0].name, track.name);

							// play() returns a readable stream of MP3 audio data
							track.play()
							.pipe(new lame.Decoder())
							.pipe(new speaker())
							.on('finish', function () {
								instance.disconnect();
							});
						}
					});
				}
			});
		});
	}
	

	function connection (sock) {

		var routes = {
			'account:add': 		accountAdd,
			'room:add': 		zoneAdd,
			'room:remove': 		zoneRemove,
			'search:generic': 	searchGeneric,
			'search:spotify': 	searchGeneric,
			'track:play': 		playTrack
		}

		socket = sock;

		console.log('A new client connected', socket.id);

		// setup socket event listeners
		for (var route in routes) {
			if (routes.hasOwnProperty(route)) {
		        socket.on(route, routes[route]);
		    }
		}

		// check the application has some setup details
		spotifyEnabled(function(err, credentials) {

			if (!err && credentials) {
				// send rooms initially
				sendZones();
			} else {
				// modal links through to login page
				showError("Application has no credentials. Click OK to setup your Spotify account.", {
					callback: 'spotify:auth',
					type: 'spotify:unauthed' 
				});
			}
		});
	}


	return {
		start: 		start,
		showError: 	showError
	}

	// io.on('connection', function(socket) {

	// 	socket.on('search:generic', function(searchObj) {

	// 		spotify.login(username, password, function (err, spotify) {

	// 			if (err) {
	// 				console.error(err);

	// 			} else {
					
	// 				console.log('Generic search', searchObj.term);

	// 				// fire the search off - results returned as XML so pase it into JSON
	// 				spotify.search(searchObj.term, function(err, response) {

	// 					var parseString = xml2js.parseString;
						
	// 					parseString(response, function (err, result) {

	// 						result = result.result;

	// 						socket.emit('search:results', {
	// 							artists: 	result.artists,
	// 							albums: 	result.albums,
	// 							tracks: 	result.tracks,
	// 							playlists: 	result.playlists
	// 						});

	// 						spotify.disconnect();
	// 					});
	// 				});
	// 			}
	// 		});
	// 	});



	// 	socket.on('search:spotify', function(uri) {

	// 		var type = spotify.uriType(uri.term);
	// 		console.log('spotify uri', uri, type);
	// 		first get a "Album" instance from the album URI
	// 		spotify.get(uri, function (err, album) {
	// 			if (err) throw err;

	// 			// first get the Track instances for each disc
	// 			var tracks = [];
	// 			album.disc.forEach(function (disc) {
	// 				if (!Array.isArray(disc.track)) return;
	// 				tracks.push.apply(tracks, disc.track);
	// 			});

	// 			console.log(tracks.map(function(t){ return t.uri; }));

	// 			function next () {

	// 				var track = tracks.shift();

	// 				if (!track) return spotify.disconnect();

	// 				track.get(function (err) {

	// 					if (err) throw err;

	// 					console.log('Playing: %s - %s', track.artist[0].name, track.name);

	// 					track.play()
	// 						.on('error', function (err) {
	// 						console.error(err.stack || err);
	// 						next();
	// 					})
	// 					.pipe(new lame.Decoder())
	// 					.pipe(new Speaker())
	// 					.on('finish', next);
	// 				});
	// 			}
	// 			next();

	// 		});
	// 	});
	// });
})();

// 
spotipi.start();