
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

        events: {

            // search results
            'click .track':           'showOptions',

            // search results
            'click .album':           'showOptions'
        },


        //
    	initialize: function (config) {

            ModalView.prototype.initialize.apply(this, arguments);

    		this.model = config.model;

            this.listenTo(this.model, 'show:playlist show:rooms track:play show:home', this.hide);
            this.listenTo(this.model, 'search:results:album', this.populateAlbum);
    	},


        checkSingleton: function () {

            $('.album').remove();
        },


        populateAlbum: function (data) {

            this.checkSingleton();
            this.render(data);
            this.show();

            console.log('populateAlbum', data);
        },


        //
    	render: function (data) {

            var albumId = data.albumId,
                tracks  = data.tracks,
                template = Handlebars.default.compile($('#tpl-album').text());

			this.$el.html(template({tracks: tracks}));
            
			$('#container').prepend(this.$el);
    	}
    });
});