
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars',
    // mixins
    'views/mixins/modal' 

], function (
    // dependencies
    $, _, Backbone, Handlebars,
    // mixins
    ModalView
) {

    'use strict';

    return ModalView.extend({

    	className: 	'playlist modal hidden',
    	tagName: 	'div',
    	id: 		'search',

    	events: {
    		'keyup input': 'delaySearch',

            // search results
            'click .track, .album, .artist': 'showOptions'
    	},

    	/*
    	 */
    	initialize: function (options) {

            ModalView.prototype.initialize.apply(this, arguments);

    		this.delaySearch;
            this.defaultResultLimit = 10;

            this.listenTo(this.model,   'show:search', 	    this.show);
            this.listenTo(this.model,   'search:results',   this.foundResults);
            this.listenTo(this.model,   'change:search', 	this.render);
            this.listenTo(this.model,   'show:playlist show:rooms track:play show:home', this.hide);
        },


        /**
         *
         */
        showOptions: function (el) {

            var options = {
                    playTrack:      0,
                    playAlbum:      0,
                    cueTrack:       0,
                    replaceQueue:   0
                },
                $el = $(el.currentTarget),
                tag = $el.attr('data-uri');

            if ($el.hasClass('track')) {
                options.playTrack = 1;
                options.cueTrack = 1;
            }

            if ($el.hasClass('album')) {
                options.replaceQueue = 1;
                options.playAlbum = 1;
            }

            if ($el.hasClass('artist')) {
                
            }

            if (!_.isEmpty(options)) {
                options.tag = tag;
                this.model.trigger('show:floater', options);    
            }
            
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
            		artists: artists,
            		albums: albums,
            		tracks: tracks,
            		playlists: playlists
        	   }
            });
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