
define([
    'underscore', 'backbone'
], function (_, Backbone) {
    
    return Backbone.Model.extend({

        /**
         * defaults object
         */
        defaults: {

            // 
            id:         undefined,
            title:      'A Song',
            artist:     'A Band',

            //
            playing:    false,

            //
            ts:         new Date().getTime()
        }
    });
});