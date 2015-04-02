
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars'
], function (
    // dependencies
    $, _, Backbone, Handlebars
) {

    'use strict';

    return Backbone.View.extend({

        tagName:    'div',
        id:         'artwork',
        className:  'disabled',


        //
    	initialize: function (config) {

    		this.model = config.model;

            this.listenTo(this.model, 'change:track', this.render);
            this.listenTo(this.model, 'change:connected', this.render);
    	},


        //
    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-artwork').text()),
                connected = this.model.get('connected');

            //
			this.$el.html(template({model:this.model.toJSON()}));
            
            if (connected && this.model.get('track')) {
                this.$el.removeClass('disabled');
                this.$el.css({
                    'background-image': 'url("' + this.model.getArtNowPlaying().uri + '")'
                });
            } else {
                this.$el.addClass('disabled');
                this.$el.css({
                    'background-image': 'none'
                });
            }

			$('#container').prepend(this.$el);
    	}
    });
});