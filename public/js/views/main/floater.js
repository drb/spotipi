
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
        className:  'floater',

        events: {
            //
            'click .close': 'hide',

            // options events
            'click .play-track, .queue-track, .play-album, .replace-playlist':  'passThru'
        },

        /**
         * initialize
         *
        **/
    	initialize: function (config) {

    		this.model      = config.model;
            this.options    = {};

            this.listenTo(this.model, 'show:floater', this.show);
            this.listenTo(this.model, 'show:error', this.hide);
    	},


        /**
         * passThru
         *
        **/
        passThru: function (el) {

            var button  = el.currentTarget,
                action  = button.className,
                socket  = this.model.get('socket'),
                data    = this.options.data;

            switch (action) {
                case 'play-track':
                    this.model.triggerAndEmit('track:play', data);
                    break;
                case 'queue-track':
                    this.model.triggerAndEmit('track:queue', data);
                    break;
                case 'play-album':
                    this.model.triggerAndEmit('album:play', data);
                    break;
                case 'queue-album':
                    this.model.triggerAndEmit('album:queue', data);
                    break;
                case 'replace-playlist':
                    this.model.triggerAndEmit('album:replace', data);
                    break;
            }

            this.hide();
        },


        /**
         * render
         *
        **/
    	render: function () {

    		var template = Handlebars.default.compile(this.model.get('templates').byName('tpl-floater')),
                keys = _.filter(this.options, function(option){
                    return option === 1;
                }).length;

			this.$el.html(template({keys: keys, options: this.options}));

			$('#container').prepend(this.$el);
            
            this.$el.removeClass('btn0 btn1 btn2 btn3 btn4 btn5 btn6').addClass('btn' + keys);
    	},

        /**
         * show
         *
        **/
        show: function (options) {
            
            this.options = options;

            this.render();
            this.$el.addClass('active');
        },

        /**
         * hide
         *
        **/
        hide: function () {

            this.$el.removeClass('active');
        }
    });
});