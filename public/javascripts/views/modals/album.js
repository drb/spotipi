
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars',
    // mixins
    'views/mixins/modal',
], function (
    // dependencies
    $, _, Backbone, Handlebars,
    //
    ModalView
) {

    'use strict';

    return ModalView.extend({

        tagName:    'div',
        className:  'album modal hidden',
        id:         'album',

        tracks:     [],

        events: {

            // closes album list
            'click .close':           'showSearch',

            // search results
            'click .track':           'showOptions',

            // search results
            'click .play-album':      'showOptions'
        },


        //
    	initialize: function (config) {

            ModalView.prototype.initialize.apply(this, arguments);

    		this.model = config.model;

            this.listenTo(this.model, 'show:playlist show:search show:rooms track:play show:home', this.hide);
            this.listenTo(this.model, 'search:results:album', this.populateAlbum);
    	},


        checkSingleton: function () {

            $('div.album').remove();
        },


        populateAlbum: function (data) {

            this.checkSingleton();
            this.render(data);
            this.show();
        },


        showSearch: function () {

            this.model.trigger('show:search');
        },


        //
    	render: function (data) {

            var albumId = data.albumId,
                tracks  = data.tracks,
                template = Handlebars.default.compile(this.model.get('templates').byName('tpl-album'));

            // set tracks
            this.tracks = tracks;

			this.$el.html(template({tracks: tracks}));
            
			$('#container').prepend(this.$el);
    	}
    });
});