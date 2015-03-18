
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars'
], function (
    // dependencies
    $, _, Backbone, Handlebars
) {

    'use strict';

    return Backbone.View.extend({

        tagName:        'ul',
        className:      'controls disabled',

        events: {
            'click .play': 'togglePlay'
        },

        //
    	initialize: function (options) {

    		this.model = options.model;
            this.listenTo(this.model, 'change:playing', this.render);
            this.listenTo(this.model, 'change:connected', this.render);
    	},

        //
    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-controls').text()),
                connected = this.model.get('connected');

			this.$el.html(template(this.model.toJSON()));

            if (connected) {
                this.$el.removeClass('disabled');
            } else {
                this.$el.addClass('disabled');
            }

			$('#container').append(this.$el);
    	},


        togglePlay: function () {

            this.model.set(
                'playing', 
                !this.model.get('playing')
            );
        }
    });
});