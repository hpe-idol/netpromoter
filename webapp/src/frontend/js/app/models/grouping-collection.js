define([
    'backbone'
], function(Backbone) {
    return Backbone.Collection.extend({

        url: 'api/groupings',

        model: Backbone.Model

    });
});
