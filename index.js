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
		request 	= require('request'), 

		// libs
		Datastore 	= require('nedb'), 
		Speaker 	= require('speaker'),
		Spotify 	= require('spotify-web'),

		// persistent datastore with manual loading
		databases 	= {},

		// socket & stream instances
		socket,
		stream,

		speakerOutput = null,
		nowPlaying = {
			uri: false
		};


	/**
	 * start
	 *
	 * kicks off the application
	 **/
	function start () {

		databases.zones = new Datastore({ filename: 'db/zones', autoload: true }),
		databases.auth 	= new Datastore({ filename: 'db/auth', 	autoload: true }),

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


	/**
	 * setupSpeaker
	 *
	 * setsup the local speaker on the device
	 **/
	function setupSpeaker () {

		if (speakerOutput) {
			return;
		}

		speakerOutput = new Speaker({
			channels: 	2,
			bitDepth: 	16,
			sampleRate: 44100
		});

		speakerOutput.on('flush', function() {
			console.log("flushing...");
		});

		speakerOutput.on('close', function() {
			console.log("closed...");
			// send track back to client
			socket.emit("track:stop");
			// kill the speaker instance
			speakerOutput = null;
			// start the next track, if there is one
			getMediaStream();
		});
	}


	/**
	 * sendZones
	 *
	 * returns the configured zones
	 **/
	function sendZones () {

		// all clients get alerted
		databases.zones.find({}, function(err, rooms) {
			io.emit('rooms:updated', rooms);	
		});
	}


	/**
	 * spotifyEnabled
	 *
	 * returns the configured zones
	 **/
	function spotifyEnabled (callback) {

		databases.auth.findOne({}, callback);
	}


	/**
	 * showError
	 *
	 * sends error to connected client
	 **/
	function showError (message, config) {

		//
		if (socket) {
			socket.emit('error:generic', {
				message: message,
				config: config || {}
			});	
		}
	}


	/**
	 * getAuthByService
	 *
	 * returns the configured credentials for the tagged service
	 **/
	function getAuthByService(service, callback) {

		var credentials;

		databases.auth.findOne({ tag: service }, function(err, credentials) {

			if (err) {
				callback(err);
			} else {

				if (credentials && credentials.hasOwnProperty('auth')) {
					callback(null, credentials.auth);
				} else {
					callback('Could not find any stored credentials.', null);
				}
			}
		});
	}


	/**
	 * accountAdd
	 *
	 * adds a spotify account to the local database
	 **/
	function accountAdd (auth) {

		var encrypted = auth;

		// update or insert new account
		databases.auth.update({ tag: 'spotify' }, { auth: encrypted, tag: 'spotify' }, { upsert: true }, function (err, doc) {

			if (err) {
				showError('Failed to add Spotify details.', {});
			} else {
				sendZones();
			}
		});
	}


	/**
	 * zoneAdd
	 *
	 * add a new zone/room
	 **/
	function zoneAdd (zone) {

		databases.zones.insert({name: zone}, function (err, doc) {
			sendZones();
		});
	}


	/**
	 * zoneRemove
	 *
	 * remove a configured zone
	 **/
	function zoneRemove (zoneId) {

		databases.zones.remove({_id: zoneId}, function (err) {
			sendZones();
		});
	}



	/**
	 * zoneEdit
	 *
	 * edit a configured zone
	 **/
	function zoneEdit (zoneData) {

		var _id 	= zoneData.id,
			name 	= zoneData.name;

		databases.zones.update({_id: _id}, {name: name}, function (err) {
			sendZones();
		});
	}



	/**
	 * searchGeneric
	 *
	 * searches artists, tracks and playlists with the supplied search term
	 **/
	function searchGeneric (searchObj) {

		var requests 	= 0,
			types  		= ['track', 'artist', 'playlist'],
			lookup 		= {
				uri: 'https://api.spotify.com/v1/search',
				headers: {
					'Accept': 'application/json'
				},
				json: true,
				qs: {
					q: 		searchObj.term,
					limit: 	searchObj.limit,
					type: 	false,
					offset: 0
				}
			},
			results = {
				artist: 	[],
				album: 		[],
				track: 		[],
				playlist: 	[]
			};

		types.forEach(function(type){

			// set lookup type
			lookup.qs.type = type;

			// do lookups
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


	/**
	 * getMediaStream
	 *
	 * connects to spotify services and returns a streamable track
	 * we pipe this to the speaker instance
	 **/
	function getMediaStream() {

		var uri = nowPlaying.uri;

		getAuthByService('spotify', function(err, credentials) {

			setupSpeaker();

			spotify.login(credentials.username, credentials.password, function (err, instance) {

				if (err) {
					//
					showError(err.toString(), {});
				} else {

					// first get a "Track" instance from the track URI
					instance.get(uri, function (err, track) {

						if (err) {

							showError(err.toString(), {});

						} else {

							try {
								console.log('Playing: %s - %s', track.artist[0].name, track.name);	
							} catch (e) {
								console.error(e);
							}

							// send track back to client
							socket.emit("track:play", track);

							// play() returns a readable stream of MP3 audio data
							track.play()
							.pipe(new lame.Decoder())
							.pipe(speakerOutput)
							.on('finish', function () {
								instance.disconnect();
							});
						}
					});
				}
			});
		});
	}


	/**
	 * playTrack
	 *
	 * ewfkjbwfekjbwefkj
	 **/
	function playTrack(uri) {

		console.log("playing track", uri);

		setupSpeaker();

		nowPlaying.uri = uri;

		if (speakerOutput) {
			speakerOutput.end();
		} else {
			getMediaStream();
		}
	}




	function stopTrack() {

		console.log("stopping track...");

		nowPlaying.uri = false;

		if (speakerOutput) {
			speakerOutput.end();
		}
	}

	

	function connection (sock) {

		var routes = {
			'account:add': 		accountAdd,
			'room:add': 		zoneAdd,
			'room:remove': 		zoneRemove,
			'room:edit': 		zoneEdit,
			'search:generic': 	searchGeneric,
			'search:spotify': 	searchGeneric,
			'track:play': 		playTrack,
			'track:stop': 		stopTrack
		};

		socket = sock;

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

	// only expose these methods
	return {
		start: 		start,
		showError: 	showError
	};
})();

// start the app
spotipi.start();

// catch errors outside of the application
process.on('uncaughtException', function(err) {
	console.error("uncaught", err);
	spotipi.showError(err.toString());
});