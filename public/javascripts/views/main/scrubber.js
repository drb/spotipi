
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
        id:         'scrubber',
        className:  'hidden', 

        events: {
            'mousemove span':   'setX',
            'click span':       'moveScrubber'
        },

        //
    	initialize: function (options) {

    		this.model = options.model;
            this.listenTo(this.model, 'change:playing', this.toggle);
    	},

        //
    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-scrubber').text());
			this.$el.html(template(this.model.toJSON()));
			$('#container').append(this.$el);
    	},

        /**
         **/
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
        },


        toggle: function () {

            var playing = this.model.get('playing');

            if (playing) {
                this.$el.removeClass('hidden');
            } else {
                this.$el.addClass('hidden');
            }
        }

    });
});