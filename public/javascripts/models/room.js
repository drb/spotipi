
define([
    'underscore', 'backbone',
    //
    'collections/playlist'
], function (
    _, Backbone, 
    //
    PlaylistCollection  
) {
    
    return Backbone.Model.extend({

        idAttribute: '_id',

        /**
         * defaults object
         */
        defaults: {
            
            // default name for the zone
            name:       'Unknown Zone',

            // seleced (this is a ui feature)
            selected:   true, 

            // the playlist associated with the room
            playlist:   new PlaylistCollection()
        }
    });
});