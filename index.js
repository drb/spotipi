/**
 * SpotiPi
 *
 * Start script with `node index.js` and connect to the service
 * with a device, pointing to the IP and port displayed when the 
 * service comes up.
 **/
var spotipi = (function(){

	var port    	= 3000,
		_ 			= require('underscore'),
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

		// speaker instance
		speakerOutput,

		markets 	= ['GB'],

		// playlist manager - simple utility for managing playlists
		playlistManager = (function(){

			function getZone (zoneId, callback) {

				databases.playlists
					.find({ zone: zoneId })
					.sort({ ts: -1 })
					.exec(callback);
			}


			/**
			 * save
			 *
			 * write the new playlist 
			 */
			function save (zoneId, playlist) {

				databases
					.playlists
					.update(
						{ zone: zoneId }, 
						{ zone: zoneId, playlist: playlist }, 
						{ upsert: true },
						function(err, response) {

						}
					);
			}


			/**
			 * getList
			 *
			 * get the playlist assigned to a zone
			 */
			function getList (zoneId, callback) {

				getZone(zoneId, callback);
			}

			/**
			 * add
			 *
			 * add track to playlist
			 */
			function add (zoneId, track, callback) {

				databases
					.playlists
					.update(
						{ zone: zoneId, 'track.uri': track.uri }, 
						{ zone: zoneId, track: track, ts: new Date().getTime() }, 
						{ upsert: true },
						function(err, response) {
							emitter(zoneId);
						}
					);
			}


			/**
			 * remove
			 *
			 * remove track from playlist
			 */
			function remove (zoneId, track, callback) {

				databases
					.playlists
					.remove(
						{ zone: zoneId, 'track.uri': track.uri }, 
						{},
						function(err, response) {
							emitter(zoneId);
						}
					);
			}


			/**
			 * replace
			 *
			 * replace playlist with track
			 */
			function replace (zoneId, track, callback) {

				databases
					.playlists
					.remove(
						{ zone: zoneId }, 
						{},
						function(err, response) {
							add(zoneId, track, function(){
								emitter(zoneId);
							});
						}
					);
			}


			function getPlaying (zoneId, callback) {

				var zones = databases.zones.find({zoneId: zoneId}, function(err, zone){
					callback(err, zone);
				});
			}


			/**
			 * emitter
			 *
			 * emits new playlist to all clients
			 */
			function emitter (zoneId) {

				getZone(zoneId, function(err, response) {
					io.emit('playlist:updated', response);
				});
				
			}

			return {
				add: 		add,
				remove: 	remove,
				replace: 	replace,
				getList: 	getList
			};
		})(),

		// local cache of the track playing now
		nowPlaying = {
			uri: false,
			track: false
		};

	/**
	 * start
	 *
	 * kicks off the application
	 **/
	function start () {

		// setup databases 
		databases.zones 	= new Datastore({ filename: 'db/zones', 	autoload: true }),
		databases.auth 		= new Datastore({ filename: 'db/auth', 		autoload: true }),
		databases.playlists = new Datastore({ filename: 'db/playlists', autoload: true }),

		// sets the public directory so we can load the scripts
		app.use(express.static(path.join(__dirname, 'public')));

		// single route
		app.get('/', function (req, res) {
			res.sendFile(__dirname + '/index.html');
		});

		server.listen(port);

		// when a ne client connects, set up the connection listeners
		io.on('connection', connection);

		// attempts to output an ip address clients can connect to
		require('dns').lookup(require('os').hostname(), function (err, add, fam) {
			console.log('Point a browser at http://' + add + ':' + port);
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

		var self = this;

		speakerOutput = new Speaker({
			channels: 	2,
			bitDepth: 	16,
			sampleRate: 44100
		});

		speakerOutput.on('flush', function() {
			// console.log("flushing...");
		});

		speakerOutput.on('close', function() {
			console.log("closed...");

			// kill the speaker instance
			speakerOutput = null;

			// nowPlaying = {
			// 	uri: false,
			// 	track: false
			// };

			// start the next track, if there is one
			getMediaStream();
		});
	}


	
	function sendZones () {

		// all clients get sent updated rooms
		databases.zones.find({}, function(err, rooms) {
			io.emit('rooms:updated', rooms);
		});

		
	}


	/**
	 * sendPlaylists
	 *
	 * returns the playlists in bulk
	 **/
	function sendPlaylists () {

		// all clients get sent updated playlists
		databases.playlists.find({}, function(err, playlists) {
			io.emit('playlists:updated', playlists);
		});
	}



	/**
	 * sendNowPlaying
	 *
	 * returns the track that is curently playing for any newly connected sockets
	 **/
	function sendNowPlaying () {

		if (nowPlaying.track) {
			socket.emit('track:play', nowPlaying.track);
		}
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

		// update or insert new account
		databases.auth.update({ tag: 'spotify' }, { auth: auth, tag: 'spotify' }, { upsert: true }, function (err, doc) {

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
	 * searches artists, tracks and playlists with the supplied search term and limit
	 **/
	function searchGeneric (searchObj) {

		var requests 	= 0,
			types  		= ['track', 'artist', 'playlist'],
			evt 		= 'search:results',
			lookup 		= {
				uri: 'https://api.spotify.com/v1/search',
				headers: {
					'Accept': 'application/json'
				},
				json: true,
				qs: {
					q: 		searchObj.term,
					limit: 	searchObj.limit,
					type: 	null,
					offset: 0,
					market: markets.join('')
				}
			},
			results = {
				artist: 	[],
				album: 		[],
				track: 		[],
				playlist: 	[]
			};

		// loop through the search types
		types.forEach(function(type){

			// set lookup type
			lookup.qs.type = type;

			// do api lookups
			request(lookup, function(err, response, body) {

				requests++;

				console.log("got %s results for %s", type, searchObj.term);

				if (!err) {
					results[type] = body[type + 's'].items;
				}

				// have all requests completed? doesn't matter if they errored
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


	function searchArtist (artistId) {

		var lookup = {
				uri: 'https://api.spotify.com/v1/artists/' + artistId + '/albums',
				headers: {
					'Accept': 'application/json'
				},
				json: true,
				qs: {
					album_type: ['album', 'single'].join(','),
					market: markets.join(''),
					offset: 	0
				}
			};

		request(lookup, function(err, response, body) {
			if (err) {
				showError(err);
			} else {
				if (body.hasOwnProperty('error')) {
					showError(body.error.message);
				} else {

					var types = _.groupBy(body.items, 'album_type');

					// toFile('artist.search.json', JSON.stringify(types, null, "\t\t"));

					socket.emit('search:results:artist', {
						artistId: artistId,
						types: types
					});		
				}
				
			}
		});
	}


	function searchAlbum (albumId) {

		console.log('album id', albumId);

		var lookup = {
				uri: 'https://api.spotify.com/v1/albums/' + albumId + '/tracks',
				headers: {
					'Accept': 'application/json'
				},
				json: true,
				qs: {
					market: markets.join(''),
					offset: 	0
				}
			};

		request(lookup, function(err, response, body) {
			if (err) {
				showError(err);
			} else {
				if (body.hasOwnProperty('error')) {
					showError(body.error.message);
				} else {

					// toFile('album.search.json', JSON.stringify(body, null, "\t\t"));

					socket.emit('search:results:album', {
						albumId: albumId,
						tracks: body.items
					});		
				}
				
			}
		});
	}


	function toFile (filename, content) {

		var fs = require('fs');
		fs.writeFile(filename, content, function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The file %s was saved!", filename);
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

		if (!uri) {
			io.emit('track:stop');
			return;
		}

		getAuthByService('spotify', function(err, credentials) {

			setupSpeaker();

			Spotify.login(credentials.username, credentials.password, function (err, instance) {

				if (err) {
					//
					showError(err.toString(), {});
				} else {

					// first get a "Track" instance from the track URI
					instance.get(uri, function (err, track) {

						if (err) {

							showError(err.toString(), {});

						} else {

							track.uri = uri;

							console.log('playing uri', track.uri);

							try {
								console.log('Playing: %s - %s', track.artist[0].name, track.name);	
							} catch (e) {
								console.error(e);
							}

							// send track back to client
							io.emit("track:play", track);

							// reference to playing track
							nowPlaying.track = track;

							//
							playlistManager.add('YCb343BnzDcSGTIw', track, function (err, playlist) {
								console.log("added to playlist");
							});

							// play() returns a readable stream of MP3 audio data
							track.play()
							.pipe(new lame.Decoder())
							.pipe(speakerOutput)
							// .on('flush', function(){
							// 	console.log('flushing track instance...');
							// })
							.on('finish', function () {
								instance.disconnect();

								nowPlaying = {
									uri: false,
									track: false
								};
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
	 * attempt to play the requested track
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



	/**
	 * stopTrack
	 *
	 * attempt to stop the track
	 **/
	function stopTrack() {

		if (nowPlaying.track) {
			console.log("stopping track...", nowPlaying.uri);
		}

		nowPlaying.uri = false;
		nowPlaying.track = false;

		// kill track on all sockets
		io.emit('track:stop');

		if (speakerOutput) {
			speakerOutput.end();
		}
	}

	
	/**
	 * connection
	 *
	 * fired when a new socket connects - all events that can be listened to are set in the
	 * routes object next to their callback
	 **/
	function connection (sock) {

		var routes = {
			'account:add': 		accountAdd,
			'room:add': 		zoneAdd,
			'room:remove': 		zoneRemove,
			'room:edit': 		zoneEdit,
			'search:generic': 	searchGeneric,
			'search:album': 	searchAlbum,
			'search:artist': 	searchArtist,
			'track:play': 		playTrack,
			'track:stop': 		stopTrack,
			// playlist functions
			'track:queue': 		playlistManager.add,
			'album:queue': 		playlistManager.add,
			'album:replace':  	playlistManager.replace
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
				// send the track playing now, if any
				sendNowPlaying();
				// send the playlists
				sendPlaylists();
				//
				//playTrack('spotify:track:1FTSo4v6BOZH9QxKc3MbVM');
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
	console.log(err);
	spotipi.showError(err.toString());
});