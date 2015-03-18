
define([
    'jquery', 'underscore', 'backbone',
    // views
    'views/layout'
], function (
    // dependencies
    $, _, Backbone,
    //
    Layout
) {

    'use strict';

    var App = function (socket) {

        var ui = new Layout({socket: socket});
        ui.render();
    }

    return App;
});