define([
    'backbone',
    'jquery',
    'handlebars',
    'app/setup',
    'app/config',
    'app/page/analysis/analysis',
    'text!templates/app/info-message.hbs',
    'text!templates/app/header.hbs',
    'text!templates/app/app.hbs',
    'bootstrap'
], function(Backbone, $, Handlebars, setup, config, AnalysisPage, messageTemplate, headerTemplate, template) {

    return Backbone.View.extend({
        el: '.page-content',

        initialize: function() {
            setup();

            this.template = Handlebars.compile(template);
            this.headerTemplate = Handlebars.compile(headerTemplate);
            this.messageTemplate = Handlebars.compile(messageTemplate);

            this.analysisPage = new AnalysisPage();

            this.render();
            Backbone.history.start();
        },

        render: function() {
            this.$el.html(this.template());

            this.$('.heading').html(this.headerTemplate());
            this.$('.info-message').html(this.messageTemplate({
                message: config().infoMessage
            }));

            this.analysisPage.setElement(this.$('.content')).render();
        }
    });
});
