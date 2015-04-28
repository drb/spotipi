
define([
    'underscore', 'backbone',
    // models
    'models/track'
], function (
    _, Backbone,
    // models
    TrackModel
) {
    'use strict';
    return Backbone.Collection.extend({

        // set model
        model: TrackModel,

        // return collection ordered by the time they were added
        comparator: function(item) {
            
            return item.get("ts");
        }
    });

});