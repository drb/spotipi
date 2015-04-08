
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
    		'keyup input':            'delaySearch',

            // search results
            'click .track':           'showOptions',

            // expand artists
            'click .artist':          'expandArtist',

            // expand album
            'click .album':           'expandAlbum'
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
        		self.doSearch(searchTerm);
        	}, 600);
        },


        /**
   		 * 
		**/
        doSearch: function (searchTerm) {

        	var eventType = 'search:generic',
                limit = this.defaultResultLimit;

            if (this.model.get('searching') === true) {
                return;
            }

			if (searchTerm && searchTerm.length > 0) {

				$('.search-placholder').text("Searching...");	

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

				$('.search-placholder').text("No results.");	
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


        populateExpanded: function (data) {

            var artist      = data.artistId,
                types       = data.types,
                template    = Handlebars.default.compile($('#tpl-search-expanded').text());

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

        	var template = Handlebars.default.compile($('#tpl-search').text());

			this.$el
				.html(template(this.model.get('search')));

			$('#container').append(this.$el);
        }
    });
});