
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

            // is the app authed?
            authed: false,

            rooms:      null,
            playlist:   null,
            search:     null,

        	// currently playing information
        	track: false
        },

        initialize: function () {

            // this.syncFromLocal();
        },

        /**
         * triggerAndEmit
         *
         * triggers on the model, and socket.emits the 
         * same event with the same data
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

        isLoggedIn: function () {

            return this.get('authed');
        },

        getArtNowPlaying: function () {

        	var track = this.get('track');

            if (!track) {
                return {};
            }
        	return track.album.cover[0];
        },

        // syncFromLocal: function () {

        //     var keys = storage.all();
            
        //     _.each(_.keys(keys), function(item) {
        //         try {
        //             this.set(item, storage.get(item));
        //         } catch (e) {}
        //     }, this);
        // },

        syncToServer: function () {

            var syncItems = ['loop', 'shuffle'],
                room = this.getActiveRoom();


            if (room) {

                _.each(syncItems, function(item) {

                    // emit for each property
                    this.get('socket').emit(
                        'room:edit:props', 
                        {
                            id: room.id,
                            properties: {
                                keyName: item, 
                                keyValue: room.get(item)
                            }
                        }
                    );
                }, this);
            }
            
            return this;
        },


        getActiveRoom: function (asJSON) {

            var room = this.get('rooms').findWhere({
                selected: true
            });

            if (room) {
                return (asJSON === true ? room.toJSON() : room);    
            } else {
                return {};
            }
        },


        getRoomPlaylist: function () {

            var room;

            if (this.get('rooms').length) {
                room = this.getActiveRoom(true);   
                if (room && _.has(room, 'playlist')) {
                    return room['playlist'] || [];
                }
            } else {
                return [];
            }
        },


        updatePlaylist: function (data) {

            var zoneId      = data.zoneId,
                items       = data.items,
                playlist    = this.rooms.get(zoneId)
                                        .get('playlist');

            if (playlist) {
                playlist.reset();
                playlist.add(items);

                this.emit('rooms:updated');
            }
        }
    });
});