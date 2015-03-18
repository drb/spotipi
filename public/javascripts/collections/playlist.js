
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

        model: TrackModel

    });

});