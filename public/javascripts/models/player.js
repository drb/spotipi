
define([
    'underscore', 'backbone', 'storage'
], function (_, Backbone, storage) {

    return Backbone.Model.extend({


        /**
         * defaults object
         */
        defaults: {

            // socket connected?
            connected: false,

        	// actual socket connection to server
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
        	track: false
        },

        initialize: function () {

            this.syncFromLocal();
        },

        /**
         * triggerAndEmit
         *
         * triggers and socket.emits the same event with the same data
         */
        triggerAndEmit: function (evt, data) {

            var socket = this.get('socket');

            socket.emit(evt, data);
            this.trigger(evt, data);
        },

        isReady: function () {

            var ready = (
                this.get('connected') &&
                (   !_.isNull(this.get('rooms')) &&
                    this.get('rooms').length > 0
                )
            );

            this.set('ready', ready);

            return ready;
        },

        getArtNowPlaying: function () {

        	var track = this.get('track');

            if (!track) {
                return {};
            }
        	return track.album.cover[0];
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