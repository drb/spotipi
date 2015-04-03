
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

        className:  'rooms modal hidden',
        tagName:    'div',
        id:         'rooms',


        events: {
            'click .room-add':              'addRoom',
            'click .room-remove':           'removeRoom',
            'click section.now-playing':    'selectRoom',
            'click .room-edit':             'editRoom'
        },


        //
    	initialize: function (config) {

    		ModalView.prototype.initialize.apply(this, arguments);

    		this.model = config.model;

            this.listenTo(this.model, 'change:connected',                       this.render);
            this.listenTo(this.model, 'show:rooms',                             this.show);
            this.listenTo(this.model, 'show:playlist show:search show:home',    this.hide);

            this.listenTo(this.model.get('rooms'), 'add remove reset', this.render);
    	},


        editRoom: function (el) {

            var name    = el.currentTarget.parentNode.getAttribute('data-name'),
                id      = el.currentTarget.parentNode.getAttribute('data-id'),
                newName = prompt('What do you want to call your room/zone?', name);

            if (newName) {

                this.model
                    .get('socket')
                    .emit('room:edit', {id: id, name: newName});
            } 
        },


        /**
         * 
         */
        addRoom: function () {

            var name = prompt('What do you want to call your room/zone?');

            if (name) {

                this.model
                    .get('socket')
                    .emit('room:add', name);
            }
        },


        /**
         * 
         */
        removeRoom: function (el) {

            var room = $(el.currentTarget).closest('li').attr('data-id');

            if (room) {
                this.model
                    .get('socket')
                    .emit('room:remove', room);
            }
        },


        /**
         * 
         */
        selectRoom: function (el) {

            var room = $(el.currentTarget).closest('li').attr('data-id');

            if (room) {
                this.model
                    .get('rooms')
                    .selectRoom(room);

                //
                this.model
                    .syncToLocal()
                    .trigger('rooms:updated');

                this.hide();
            }
        },


        /**
         * 
         */
    	render: function () {

    		var template = Handlebars.default.compile($('#tpl-rooms').text()),
                connected = this.model.get('connected');

            //
			this.$el.html(template({
				rooms: this.model.get('rooms').toJSON()
			}));
           
			$('#container').prepend(this.$el);
    	}
    });
});