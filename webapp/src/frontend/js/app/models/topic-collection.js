define([
    'backbone',
    'app/models/topic-model'
], function(Backbone, TopicModel) {
    return Backbone.Collection.extend({

        url: 'api/topics',

        model: TopicModel

    });
});
