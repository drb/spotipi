
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

    	className:  'playlist modal hidden',
        tagName:    'div',
        id:         'playlist',

        events: {
            'click .control-shuffle':   'toggleShuffle',
            'click .control-loop':      'toggleLoop'
        },

        /*
         *
         */
        initialize: function (options) {

            ModalView.prototype.initialize.apply(this, arguments);

            this.activeRoom;
            this.hidden = true;

            this.listenTo(this.model, 'show:playlist',                      this.show);
            this.listenTo(this.model, 'show:rooms show:search show:home',   this.hide);
            this.listenTo(this.model, 'rooms:updated playlist:updated',     this.render);
        },

        /**
         *
         */
        render: function () {

            var template = Handlebars.default.compile(this.model.get('templates').byName('tpl-playlist')),
                room = this.model.getActiveRoom(true),
                playlist = this.model.getRoomPlaylist();

            this.$el
                .empty()
                .html(template({
                    model:      this.model.toJSON(),
                    room:       room,
                    playlist:   playlist
                }));

            $('#container').append(this.$el);
        },


        toggleLoop: function() {

            var room = this.model.getActiveRoom();

            room.set('loop', !room.get('loop'));
            this.model.syncToServer();

            this.render();
        },

        toggleShuffle: function() {

            var room = this.model.getActiveRoom();

            room.set('shuffle', !room.get('shuffle'));
            this.model.syncToServer();

            this.render();
        }

    });
});