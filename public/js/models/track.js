
define([
    'underscore', 'backbone'
], function (_, Backbone) {
    
    return Backbone.Model.extend({

        /**
         * defaults object
         */
        defaults: {
            id:         '123',
            name:       'Some Song',
            artist:     'Some Band',
            playing:    false
        }
    });
});