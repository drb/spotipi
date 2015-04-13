
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars'
], function (
    // dependencies
    $, _, Backbone, Handlebars
) {

    'use strict';

    return Backbone.View.extend({

        tagName:        'div',
        id:             'scrubber',
        className:      'hidden', 
        updater:        null,

        duration:       0,
        scrubStarted:   0,

        // these events are disabled at the moent, as syncing the audio stream with random
        // times along the track is a pain in the arse
        events: {
            //'mousemove span':   'setX',
            //'click span':       'moveScrubber'
        },

        //
    	initialize: function (options) {

            this.duration     = 0;
    		this.model        = options.model;
            
            this.listenTo(this.model, 'change:track', this.toggle);
    	},

        //
    	render: function () {

    		var template = Handlebars.default.compile(this.model.get('templates').byName('tpl-scrubber'));
			this.$el.html(template(this.model.toJSON()));
			$('#container').append(this.$el);
    	},

        /**
        setX: function (el) {

            var scrubberPosition = this.model.get('scrubberPosition') || 0,
                offset = el.offsetX,
                maxWidth = $(el.currentTarget).width(),
                // get nearest 10th
                position = (Math.round((((offset / maxWidth) * 100) / 100) * 10) * 10);

            // set on the model
            if (scrubberPosition != position) {
                this.model.set('scrubberPosition', position);
            }

        },

        moveScrubber: function (el) {
            
            $(el.currentTarget).removeClass().addClass('progress' + (this.model.get('scrubberPosition')));
        }, **/


        /**
         * updatePosition
         *
         * moves the scrubber position
         * 
         * @return {[type]}
         */
        updatePosition: function () {

            var progress = parseInt(new Date().getTime() - this.scrubStarted),
                position = Math.round((progress / this.duration) * 100);

            this.model.set('scrubberPosition', position);

            $('#scrubber span').removeClass().addClass('progress' + (this.model.get('scrubberPosition')));
        },


        /**
         * toggle
         *
         * toggles the visible state, and starts the updater to move the scrubber
         * 
         * @return {[type]}
         */
        toggle: function () {

            var self = this,
                playing = this.model.get('track');

            this.duration = playing.duration;

            if (playing !== false) {

                this.$el.removeClass('hidden');

                this.scrubStarted = new Date().getTime();
                this.updater = setInterval(function() {
                    self.updatePosition();
                }, 1000);

            } else {

                this.$el.addClass('hidden');

                if (this.updater) {
                    clearInterval(this.updater);
                }
            }
        }
    });
});