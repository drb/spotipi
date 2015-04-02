
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars'
], function (
    // dependencies
    $, _, Backbone, Handlebars
) {

    'use strict';

    return Backbone.View.extend({

    	events: {
    		'click a.playlist':   'playlist',
    		'click a.search':     'search',
            'click a.rooms':      'rooms'
    	},

    	tagName:   'header',
        className: 'disabled',

    	initialize: function (options) {
    		
    		this.model    = options.model;

            this.listenTo(this.model, 'change:connected', this.render);
            this.listenTo(this.model, 'rooms:updated', this.render);
    	},

    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-header').text()),
                connected = this.model.get('connected');

			this.$el.html(template({connected: connected, isReady: this.model.isReady()}));

            if (connected) {
                this.$el.removeClass('disabled');
            } else {
                this.$el.addClass('disabled');
            }

			$('#container').prepend(this.$el);
    	},

        toggleDisabled: function () {

            this.render();
        },


    	playlist: function () {

            if (this.model.isReady()) {
                this.model.trigger('show:playlist');
            }
    	},

    	search: function () {

            if (this.model.isReady()) {
                this.model.trigger('show:search');
            }
    	},

        rooms: function () {

            if (this.model.get('connected')) {
                this.model.trigger('show:rooms');
            }
        }

    });
});