
define([
    'underscore', 'backbone', 'storage'
], function (_, Backbone, storage) {

    return Backbone.Model.extend({


        /**
         * defaults object
         */
        defaults: {

        	// socket connection to server
        	socket: null,

        	// is track playing?
        	playing: false,

            // shuffle mode on?
            shuffle: false,

            // loop mode on?
            loop: false,

            rooms:      null,
            playlist:   null,
            search:     null,

        	// currently playing information
        	track: {
        		artwork: [{
        			path: false
        		}]
        	}
        },

        initialize: function () {

            this.syncFromLocal();
        },

        getArtNowPlaying: function () {

        	var track = this.get('track');
        	return track.artwork[0];
        },

        syncFromLocal: function () {

            var keys = storage.all();
            
            _.each(_.keys(keys), function(item) {
                try {
                    this.set(item, storage.get(item));
                } catch (e) {}
            }, this);
        },

        syncToLocal: function () {

            var syncItems = ['loop', 'shuffle'];

            _.each(syncItems, function(item) {
                storage.set(item, this.get(item));
            }, this);
            
            return this;
        }
    });
});