
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
         */
        show: function (trigger) {

            if (this.hidden) {
                this.$el.removeClass('hidden'); 
            } else {
                this.$el.addClass('hidden');
            }

            this.hidden = !this.hidden;
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