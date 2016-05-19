define([
    'backbone',
    'jquery',
    'underscore',
    'handlebars',
    'app/page/analysis/prepare-panel',
    'app/page/analysis/upload/upload-panel',
    'app/page/analysis/results/results-panel',
    'app/models/upload-progress-model',
    'app/models/index-model',
    'app/models/topic-collection',
    'text!templates/app/page/analysis/analysis.hbs'
], function(Backbone, $, _, Handlebars, PreparePanel, UploadPanel, ResultsPanel, UploadProgressModel, IndexModel, TopicCollection, template) {

    return Backbone.View.extend({

        initialize: function() {
            this.template = Handlebars.compile(template);

            var uploadProgressModel = new UploadProgressModel();
            var indexModel = new IndexModel();
            var topicCollection = new TopicCollection();

            this.panels = [
                new PreparePanel({
                    uploadProgressModel: uploadProgressModel,
                    indexModel: indexModel,
                    topicCollection: topicCollection
                }),
                new UploadPanel({
                    uploadProgressModel: uploadProgressModel,
                    indexModel: indexModel,
                    topicCollection: topicCollection
                }),
                new ResultsPanel({
                    topicCollection: topicCollection
                })
            ];
        },

        render: function() {
            this.$el.html(this.template());

            _.each(this.panels, function(panel) {
                panel.render();
                this.$('.panels').append(panel.$el);
            }, this);
        }
    });
});
