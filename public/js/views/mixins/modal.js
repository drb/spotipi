
define([
    // dependencies
    'backbone', 'underscore'
], function (
    // dependencies
    Backbone, _
) {

    'use strict';

    return Backbone.View.extend({

        data: {},

    	initialize: function (options) {

            this.data       = {};
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
                    replaceQueue:   0,
                    cueAlbum:       0
                },
                $el = $(el.currentTarget),
                data = $el.attr('data-uri');

            // track clicked
            if ($el.hasClass('track')) {
                options.playTrack = 1;
                options.cueTrack = 1;

                options.data = data;
            }

            // album clicked
            if ($el.hasClass('play-album')) {
                options.replaceQueue = 1;
                options.playAlbum   = 1;
                options.cueAlbum    = 1;

                if (this.tracks) {
                    options.data = this.data;    
                }
            }

            console.log('dat incoing', options);

            // show floater
            if (!_.isEmpty(options)) {
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