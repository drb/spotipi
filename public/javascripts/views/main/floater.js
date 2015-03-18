
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
            'click .close': 'hide',
            // options events
            
        },

        /**
         * initialize
         *
        **/
    	initialize: function (config) {

    		this.model      = config.model;
            this.options    = {};

            this.listenTo(this.model, 'show:floater', this.show);
    	},


        /**
         * render
         *
        **/
    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-floater').text()),
                keys = _.filter(this.options, function(option){
                    return option === 1;
                }).length

			this.$el.html(template({keys: keys, options: this.options}));

			$('#container').prepend(this.$el);
            
            this.$el.removeClass('btn0 btn1 btn2 btn3 btn4 btn5 btn7').addClass('btn' + keys);
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