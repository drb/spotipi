
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars',
    //models
    'models/player',
    // collections
    'collections/search',
    'collections/rooms',
    // views
    'views/nav/header',
    'views/main/artwork',
    'views/main/scrubber',
    'views/main/controls',
    'views/main/floater',
    // modal windows
    'views/modals/rooms',
    'views/modals/search',
    'views/modals/playlist',
    'views/modals/login',
    // errors
    'views/main/ui/alert'
], function (
    // dependencies
    $, _, Backbone, Handlebars,
    // models
    PlayerModel,
    // collections
    SearchCollection,
    RoomsCollection,
    // views
    Header,
    Playing,
    Scrubber,
    Controls,
    Floater,
    // modal windows
    Rooms,
    Search,
    Playlist,
    Login,
    // errors 
    ErrorMessage
) {

    'use strict';

    return Backbone.View.extend({


        /**
         * [initialize description]
         * 
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
    	initialize: function (options) {

    		var constr,
                self        = this,
                templates   = options.templates,
    			socket      = options.socket;

			// now playing 
    		this.model = new PlayerModel();
    		this.model.set({

                // template cache
                templates:  templates,

                // socket
    			socket:     socket,

                // ui collections
                search:     new SearchCollection(),
                rooms:      new RoomsCollection()
    		});

            socket.on('connect', function(conn) {
                self.model.set('connected', true);
            });

            socket.on('disconnect', function(conn) {
                self.model.set('connected', false);
            });

            // fired when the socket connects
            socket.on('app:setup', function(credentials) {
                self.model.set('authed', credentials);
            });            

            //
            socket.on('error:generic', function (error) {
                var alert = self.subViews.alert;
                self.model.trigger('show:error');
                alert.showError(error);
            });

            // socket has recieved results
            socket.on('search:results', function(results) {
                self.model.trigger('search:results', results);
            });

            // socket has recieved results for artist search
            socket.on('search:results:artist', function(results) {
                self.model.trigger('search:results:artist', results);
            });

            // socket has recieved results for album search
            socket.on('search:results:album', function(results) {
                self.model.trigger('search:results:album', results);
            });

            // room list has updated
            socket.on('rooms:updated', function(rooms) {

                var roomsCollection = self.model.get('rooms');

                // reset the collection, we're building from scratch
                roomsCollection.reset();
                roomsCollection.add(rooms);

                // console.log(roomsCollection.models);

                self.model.trigger('rooms:updated');
            });

            socket.on('track:play', function(track) {
                self.model.set({
                    'track': track, 
                    'playing': true
                });
            });

            socket.on('track:stop', function() {
                self.model.set({
                    'track': false, 
                    'playing': false
                });
            });

            socket.on('playlist:updated', function(data) {

                var room = self.model.get('rooms').get(data.zone),
                    playlist = room.get('playlist');

                playlist.reset();
                playlist.add(data);

                self.model.trigger('playlist:updated');
            });

			// default constructor for sub views
    		constr = {
    			model: this.model
    		};

			// sub views to make up the UI
			this.subViews = {

				// main UI elements
				header:     new Header(constr),
				playing:    new Playing(constr),
				scrubber:   new Scrubber(constr),
				controls:   new Controls(constr),

				// modal windows
				search:     new Search(constr),
				playlist:   new Playlist(constr),
                rooms:      new Rooms(constr),
                login:      new Login(constr),

                // custom control
                floater:    new Floater(constr),

                // alerts
                alert:      new ErrorMessage(constr)
 			};

			// attach each subview
			_.each(this.subViews, function(subView) {
				subView.render();
			}, this);
    	},

        /**
         * onClose
         * 
         * @return {[type]} [description]
         */
    	onClose: function () {}
    });
});