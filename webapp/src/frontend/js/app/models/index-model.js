define([
    'backbone'
], function(Backbone) {
    return Backbone.Model.extend({

        defaults: {
            exists: false
        },

        url: 'api/index'
    });
});