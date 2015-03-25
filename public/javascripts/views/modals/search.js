
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

            //
            this.listenTo(this.model, 'show:playlist show:rooms', this.hide);
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
                $el = $(el.currentTarget);

            if ($el.hasClass('track')) {
                options.playTrack = 1;
                options.cueTrack = 1;
            }

            if ($el.hasClass('album')) {
                options.replaceQueue = 1;
                options.playAlbum = 1;
            }

            this.model.trigger('show:floater', options);
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
        	}, 300);
        },


        /**
   		 * 
		**/
        doSearch: function (searchTerm) {

        	var eventType = 'search:generic';

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
						term: searchTerm
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

        	var artists = 	this.restrict(results.artists[0].artist, this.defaultResultLimit),
        		albums = 	this.restrict(results.albums[0].album, this.defaultResultLimit),
        		tracks = 	this.restrict(results.tracks[0].track, this.defaultResultLimit),
        		playlists = [];

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


        restrict: function (array, limit) {

        	var yielded = [],
        		offset = 0;

        	_.each(array, function(obj) {

        		if ((offset+1) <= limit) {
        			yielded.push(obj);	
        		}
        		
        		offset += 1;
        	});

        	return yielded;
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