
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

            this.listenTo(this.model, 'show:playlist',      this.show);
            this.listenTo(this.model, 'show:rooms show:search', this.hide);
            this.listenTo(this.model, 'rooms:updated', this.render);
        },

        /**
         *
         */
        render: function () {

            var template = Handlebars.default.compile($('#tpl-playlist').text()),
                playlist = this.getRoomPlaylist();

            this.$el
                .empty()
                .html(template({model: this.model.toJSON(), room: playlist}));

            $('#container').append(this.$el);
        },


        /**
         * getRoomPlaylist
         *
         */
        getRoomPlaylist: function () {

            // grab the active room and get the playlist
            var playlist = this.model.get('rooms').findWhere({selected: true});

            // 
            return (playlist ? playlist.toJSON() : {});
        },


        toggleLoop: function() {

            var loop = this.model.get('loop');

            this.model
                .set('loop', !loop)
                .syncToLocal();

            this.render();
        },

        toggleShuffle: function() {

            var shuffle = this.model.get('shuffle');

            this.model
                .set('shuffle', !shuffle)
                .syncToLocal();

            this.render();
        }

    });
});