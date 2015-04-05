
define([
    // dependencies
    'backbone'
], function (
    // dependencies
    Backbone
) {

    'use strict';

    return Backbone.View.extend({

    	initialize: function (options) {

    		this.hidden 	= true;
    		this.model 		= options.model;
    	},

    	/**
         * show
         *
         * show the modal - scrolls content back to top
         */
        show: function (trigger) {

            if (this.hidden) {
                this.$el.removeClass('hidden'); 
            } else {
                this.$el.addClass('hidden');
            }

            this.hidden = !this.hidden;

            $(this.$el).animate({ scrollTop: 0 }, "fast");
        },


        hide: function () {

            if (!this.hidden) {
                this.show();
            }
        },

        /**
         *
         */
    	forceClosed: function (foo) {

            if (this.hidden) {
                this.$el.removeClass('hidden'); 
            } else {
                this.$el.addClass('hidden');
            }
        }

    });
});