
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
        * showOptions
        * 
        * @param  {el}
        * @return {none}
        */  
        showOptions: function (el) {

            var options = {
                    playTrack:      0,
                    playAlbum:      0,
                    cueTrack:       0,
                    replaceQueue:   0
                },
                $el = $(el.currentTarget),
                tag = $el.attr('data-uri');

            if ($el.hasClass('track')) {
                options.playTrack = 1;
                options.cueTrack = 1;
            }

            if ($el.hasClass('album')) {
                options.replaceQueue = 1;
                options.playAlbum = 1;
            }

            if ($el.hasClass('artist')) {
                
            }

            if (!_.isEmpty(options)) {
                options.tag = tag;
                this.model.trigger('show:floater', options);    
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