
define([
    'underscore', 'backbone'
], function (
    _, Backbone
) {
    'use strict';
    return Backbone.Collection.extend({

        url: '/templates.json',

        byName: function (tag) {

            return this
                .findWhere({
                    name: tag
                })
                .get('content');
        }
    });

});