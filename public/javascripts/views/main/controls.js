
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars'
], function (
    // dependencies
    $, _, Backbone, Handlebars
) {

    'use strict';

    return Backbone.View.extend({

        tagName:        'ul',
        className:      'controls disabled',

        events: {
            'click .play': 'togglePlay'
        },

        //
    	initialize: function (options) {

    		this.model = options.model;
            
            this.listenTo(this.model, 'change:track',       this.render);
            this.listenTo(this.model, 'change:playing',     this.render);
            this.listenTo(this.model, 'change:connected',   this.render);
            this.listenTo(this.model, 'rooms:updated',      this.render);
    	},

        //
    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-controls').text());

			this.$el.html(template(this.model.toJSON()));

            if (this.model.isReady()) {
                this.$el.removeClass('disabled');
            } else {
                this.$el.addClass('disabled');
            }

			$('#container').append(this.$el);
    	},


        togglePlay: function () {

            var message = 'play';

            if (!this.model.isReady()) {
                return;
            }

            if (this.model.get('track')) {
                message = 'stop';
                this.model.set({'track': false});
            }

            this.model.set({
                'playing': !this.model.get('playing')
            });

            // track:play or track:stop
            this.model
                .get('socket')
                .emit('track:' + message);
        }
    });
});