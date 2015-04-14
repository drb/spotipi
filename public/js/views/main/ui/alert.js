
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
        className:  'alert',

        events: {
            'click button.confirm': 'callbacks',
            'click .close':         'close',
            'click .alert':         'close'
        },

        //
    	initialize: function (config) {

            this.model = config.model;

            this.message = {
                message: ""
            };
    	},


        callbacks: function (e) {

            if (this.callback) {
                console.log("doing callback", this.callback);
                this.model.trigger(this.callback);
            }

            this.close();
        },


        close: function () {
            
            this.remove();
        },

        //
        showError: function (error) {

            console.log("adding error", error);

            this.$el.addClass('error');

            this.message = error.message || 'Foo';

            if (error.config && error.config.callback) {
                this.callback = error.config.callback;    
            }
            
            this.render();
        },

        //
        showMessage: function (message) {

            this.$el.removeClass('error');

            this.message    = message.message;
            this.callback   = message.config.callback;

            this.render();
        },

        //
    	render: function () {

    		var template = Handlebars.default.compile(this.model.get('templates').byName('tpl-alert'));
            
			this.$el.html(template({ message: this.message }));
            
            if (this.message.length > 0) {
                $('body').append(this.$el);    
            }

            this.delegateEvents();
    	}
    });
});