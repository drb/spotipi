/**
 *
 **/
require.config({
	baseUrl: 'javascripts',
	shim: {
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		'handlebars': {
			exports: "Handlebars"
		}
	},
	paths: {

		// socket is served from socketio server
		socketio: 	'/socket.io/socket.io',

		// 3rd party libs
		jquery: 	'library/jquery',
		storage: 	'library/storage',
		backbone: 	'library/backbone',
		underscore: 'library/underscore',
		handlebars: 'library/handlebars.amd'
	}
});


/**
 * Initialize the app
 **/
require([
	'jquery', 'underscore', 'backbone', 'socketio', 'app'
], 
function ($, _, Backbone, IO, App) {

	'use strict';

	// start the app
    var socket 	= IO(),
    	app 	= new App(socket);

    // 
    socket.emit("hello:me", {
		me: localStorage.getItem('auth') || false
	});
	
});