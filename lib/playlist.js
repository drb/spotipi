/*
 * Playlist Manager - simple utility for managing playlists
 * 
 */

var PlaylistManager = function(databases, socket, io) {

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

};

// export module
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = PlaylistManager;
    }
    exports.PlaylistManager = PlaylistManager;
}