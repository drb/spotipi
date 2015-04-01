
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
            'click #save-credentials':   'setCredentials',
            'focus input':               'resetErrors'
        },

        /*
         *
         */
        initialize: function (options) {

            ModalView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'show:rooms', this.hide);
            this.listenTo(this.model, 'spotify:auth', this.show);

            this.delegateEvents();
        },


        resetErrors: function (el) {

            $(el.currentTarget).removeClass('error');
        },

        /**
         *
         */
        setCredentials: function (el) {

            var username    = $('#username').val(),
                password    = $('#password').val(),
                data        = {
                    username: username, 
                    password: password
                },
                socket      = this.model.get('socket');

            if (username.length === 0 || password.length === 0) {

                if (username.length === 0) {
                    $('#username').addClass('error').blur();
                }

                if (password.length === 0) {
                    $('#password').addClass('error').blur();
                }

            } else {
                
                socket.emit('account:add', data);    
            }

            return false;
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