
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
            'click h1.home':      'home',
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

    		var template = Handlebars.default.compile(this.model.get('templates').byName('tpl-header')),
                connected = this.model.get('connected');

			this.$el.html(template({
                connected: connected,
                isReady: this.model.isReady(),
                isLoggedIn: this.model.isLoggedIn()
            }));

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


        home: function() {
            this.model.trigger('show:home');
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

            if (this.model.get('connected') && this.model.isLoggedIn()) {
                this.model.trigger('show:rooms');
            }
        }

    });
});