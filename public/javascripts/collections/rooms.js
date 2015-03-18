
define([
    'underscore', 'backbone',
    // models
    'models/room'
], function (
    _, Backbone,
    // models
    RoomModel
) {
    'use strict';
    
    return Backbone.Collection.extend({

        model: RoomModel,

        selectRoom: function (roomId) {

            var room = this.get(roomId);

            // mark all as unselected
            this.invoke('set', { selected: false });

            // mark the selected room
            room.set('selected', true);

            return this;
        }

    });

});