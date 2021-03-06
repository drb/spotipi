
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars',
    // mixins
    'views/mixins/modal',
    // views
    'views/modals/album'

], function (
    // dependencies
    $, _, Backbone, Handlebars,
    // mixins
    ModalView,
    // views
    AlbumView
) {

    'use strict';

    return ModalView.extend({

    	className: 	'playlist modal hidden',
    	tagName: 	'div',
    	id: 		'search',

    	events: {
            // do search after delay
    		'keyup input':                  'delaySearch',

            // search results
            'click .track':                 'showOptions',

            // expand artists
            'click .artist, .playlist':     'expandPassThru',

            // expand album
            'click .album':                 'expandAlbum'
    	},

    	/*
    	 */
    	initialize: function (options) {

            ModalView.prototype.initialize.apply(this, arguments);

    		this.delaySearch;
            this.defaultResultLimit = 10;

            this.listenTo(this.model,   'show:search', 	            this.show);
            this.listenTo(this.model,   'search:results',           this.foundResults);
            this.listenTo(this.model,   'change:search', 	        this.render);
            this.listenTo(this.model,   'search:results:artist',    this.populateExpanded);
            this.listenTo(this.model,   'show:playlist show:rooms track:play show:home show:album', this.hide);
        },


        
        

        /**
         *
         */
        delaySearch: function (e) {

        	var searchTerm = e.currentTarget.value,
        		self = this;

        	if (this.delaySearch) {
        		clearTimeout(this.delaySearch);
        	}

        	this.delaySearch = setTimeout(function() {
        		self.delaySearchDebounce(searchTerm);
        	}, 600);
        },


        /**
   		 * 
		**/
        delaySearchDebounce: function (searchTerm) {

        	var eventType = 'search:generic',
                limit = this.defaultResultLimit;

            if (this.model.get('searching') === true) {
                return;
            }

			if (searchTerm && searchTerm.length > 0) {

				$('li.subtitle').text("Searching...");	

				if (searchTerm.indexOf('spotify:') > -1) {
					eventType = 'search:spotify';
				}

                //
				this.model.set({
					'searching': true,
					'searchTerm': searchTerm
				});

				// emit search
				this.model.get('socket').emit(
					eventType, {
						term: searchTerm,
                        limit: limit
					}
				);

			} else {

				this.model.set({
					search: {},
					'searchTerm': undefined, 
					'searching': false
				}, { unset: true });

				$('li.subtitle').text("No results.");	
			}
        },


        foundResults: function (results) {

        	var artists = 	results.artist,
        		albums = 	results.album,
        		tracks = 	results.track,
        		playlists = results.playlist;

        	this.model.set({
                'searching': false,
                'search': {

            		searching: false,

            		// persist search term
            		searchTerm: this.model.get('searchTerm'),

            		// artist data
            		artists:      artists,
            		albums:       albums,
            		tracks:       tracks,
            		playlists:    playlists
        	   }
            });
        },


        expandPassThru: function (el) {

            var $el = $(el.currentTarget);

            if ($el.hasClass('artist')) {
                // artist search
                this.expandArtist(el);
            } else if ($el.hasClass('playlist')) {
                // playlist search
                this.expandPlaylist(el);
            }
        },



        expandArtist: function (el) {
            
            var artistId    = el.currentTarget.getAttribute('data-id'),
                $el         = $(el.currentTarget).closest('li'),
                expanded    = $el.hasClass('expanded');
            
            if (expanded) {
                $el.removeClass('expanded');
                this.$el.find('li.artist-expanded').remove();
            } else {
                $el.addClass('expanded');
                this.model.get('socket').emit('search:artist', artistId);
            }
        },


        expandPlaylist: function (el) {
            
            var playlistId  = el.currentTarget.getAttribute('data-id'),
                userName    = el.currentTarget.getAttribute('data-user'),
                $el         = $(el.currentTarget).closest('li'),
                expanded    = $el.hasClass('expanded');
            
            if (expanded) {
                $el.removeClass('expanded');
                this.$el.find('li.artist-expanded').remove();
            } else {
                $el.addClass('expanded');
                this.model.get('socket').emit('search:playlist', {
                    userId: userName,
                    playlistId: playlistId
                });
            }
        },


        populateExpanded: function (data) {

            var artist      = data.artistId,
                types       = data.types,
                template    = Handlebars.default.compile(this.model.get('templates').byName('tpl-search-expanded'));

            // append 
            this.$el.find('li#artist-' + artist).after(template({types: types}));
        },


        /**
         * expandAlbum
         *
         * 
         * @return {[type]}
         */
        expandAlbum: function (el) {

            var albumId     = el.currentTarget.getAttribute('data-id'),
                slideView   = new AlbumView({model: this.model});

            if (albumId) {
                this.model.trigger('show:album');
                this.model.get('socket').emit('search:album', albumId);
            }
        },


        /**
         *
         */
        render: function () {

        	var template = Handlebars.default.compile(this.model.get('templates').byName('tpl-search'));

			this.$el
				.html(template(this.model.get('search')));

			$('#container').append(this.$el);
        }
    });
});