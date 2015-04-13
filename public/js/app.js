
define([
    'jquery', 'underscore', 'backbone',
    // collections
    'collections/templates',
    // views
    'views/layout'
], function (
    // dependencies
    $, _, Backbone,
    //
    TemplatesCollection,
    // views
    Layout
) {

    'use strict';

    var App = function (socket) {

        var templates = new TemplatesCollection(),
            ui;

        $.when(templates.fetch())
            .done(function () {
                ui = new Layout({
                    templates: templates,
                    socket: socket
                });
                ui.render();
            });
    };

    return App;
});