
define([
    // dependencies
    'jquery', 'underscore', 'backbone', 'handlebars',
    // mixins
    'views/mixins/modal' 
], function (
    // dependencies
    $, _, Backbone, Handlebars,
    // mixins
    ModalView
) {

    'use strict';

    return ModalView.extend({

    	className:  'login modal hidden',
        tagName:    'div',
        id:         'login',

        events: {
            'click .login':   'setCredentials'
        },

        /*
         *
         */
        initialize: function (options) {

            ModalView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'spotify:auth', this.show);
        },

        /**
         *
         */
        setCredentials: function (el) {

            var form    = $('#form-user-login', this.$el).serializeArray().map(function(x) { data[x.name] = x.value; }),
                socket  = this.model.get('socket');

            console.log("form", form);

            socket.emit('login', form);
        },

        /**
         *
         */
        render: function () {

            var template = Handlebars.default.compile($('#tpl-login').text());

            this.$el
                .empty()
                .html(template({}));

            $('#container').append(this.$el);
        }

    });
});