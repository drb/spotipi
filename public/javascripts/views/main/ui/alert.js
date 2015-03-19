
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
            'click .close': 'close'
        },

        //
    	initialize: function (config) {

            this.message = {
                message: ""
            }
    	},


        callbacks: function () {

            if (this.callback) {
                this.callback();
            }

            this.close();
        },


        close: function () {
            
            this.remove();
        },


        showError: function (error) {

            this.$el.addClass('error');
            this.message = error;
            this.render();
        },


        showMessage: function (message) {

            this.$el.removeClass('error');
            this.message = message;
            this.render();
        },

        //
    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-alert').text());
            
			this.$el.html(template({ message: this.message.message }));
            
			$('body').append(this.$el);
    	}
    });
});