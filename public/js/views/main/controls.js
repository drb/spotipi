
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
            this.listenTo(this.model, 'change:connected',   this.render);
            this.listenTo(this.model, 'rooms:updated',      this.render);
    	},

        //
    	render: function () {

    		var template = Handlebars.default.compile(this.model.get('templates').byName('tpl-controls'));

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

            if (this.model.get('track') !== false) {
                message = 'stop';
            }

            // track:play or track:stop
            this.model
                .get('socket')
                .emit('track:' + message);
        }
    });
});