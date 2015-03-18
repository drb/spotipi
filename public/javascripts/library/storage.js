
define(['backbone'], function (Backbone) {
    'use strict';

    var hasStorage = (function () {
        try {
            return window.localStorage !== null;
        } catch (e) {
            return false;
        }
    }());

    Backbone.activeStorage = Backbone.activeStorage || {};

    return {

        /**
         * set
         * set the local storage according to the key/value entered
         *
         * @param key {string} the key to save the value to
         * @param value {*} anything that can be stringify
         */
        set: function (key, value) {

            if (hasStorage) {
                window.localStorage.setItem(key, JSON.stringify(value));
                return this;
            }

            Backbone.activeStorage[key] = value;

            return this;
        },


        /**
         * get
         * retrieves the storage/cookies containing the information
         * associated with the supplied key
         *
         * @param key {string} the key to get the value of
         * @param options {object} optional options object for silent parsing
         * @returns {string} value of {key}
         */
        get: function (key, options) {

            options = options || {};

            if (hasStorage) {
                if (options.silent) {
                    return localStorage.getItem(key);
                }

                return JSON.parse(localStorage.getItem(key));
            }

            return Backbone.activeStorage[key];
        },


        /**
         * remove
         * removes the storage item/cookie associated with the
         * supplied key
         *
         * @param key {string} the key to remove from session
         */
        remove: function (key) {

            if (hasStorage) {
                window.localStorage.removeItem(key);
                return;
            }

            delete Backbone.activeStorage[key];

            return this;
        },


        /**
         * destroy
         * destroys the localStorage set by the application, no parameters
         * required, more of a brute force thing
         */
        destroy: function () {

            // to destroy, iterate through storage and remove
            if (hasStorage) {
                window.localStorage.clear();
                return this;
            }

            Backbone.activeStorage = {};

            return this;
        },


        /**
         * all
         * debug method for returning the localStorage Object - kinda useless
         *
         * @returns {object} the localStorage Object
         */
        all: function () {
            if (hasStorage) {
                return window.localStorage;
            }

            return Backbone.activeStorage;
        },


        /**
         * key
         * return the key of the stored value at the supplied index -
         * localStorage is a strange array like object
         *
         * @param index {number} the index to check
         * @returns {string} the key of the index
         */
        key: function (index) {
            if (hasStorage) {
                return window.localStorage.key(index);
            }

            return Backbone.activeStorage[index];
        }
    };
});