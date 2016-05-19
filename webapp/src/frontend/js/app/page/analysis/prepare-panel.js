define([
    'backbone',
    'jquery',
    'handlebars',
    'text!templates/app/page/analysis/modals/clear-index.hbs',
    'text!templates/app/page/analysis/modals/instructions.hbs',
    'text!templates/app/page/analysis/prepare-panel.hbs'
], function(Backbone, $, Handlebars, clearModalTemplate, instructionsTemplate, template) {

    return Backbone.View.extend({

        events: {
            'click .js-create-index': 'createIndex',
            'click .js-delete-topics-confirm': 'deleteTopics'
        },

        initialize: function(options) {
            this.template = Handlebars.compile(template);
            this.clearModalTemplate = Handlebars.compile(clearModalTemplate);
            this.instructionsTemplate = Handlebars.compile(instructionsTemplate);
            this.uploadProgressModel = options.uploadProgressModel;
            this.indexModel = options.indexModel;
            this.topicCollection = options.topicCollection;

            this.listenTo(this.uploadProgressModel, 'change:uploadState', this.toggleClearButton);
        },

        render: function() {
            this.$el.html(this.template());
            this.$el.append(this.clearModalTemplate());
            this.$el.append(this.instructionsTemplate());
        },

        toggleClearButton: function(model) {
            if(model.wasInProgress()) {
                this.$('.js-delete-topics').prop('disabled', model.isInProgress());
            }
        },

        deleteTopics: function() {
            this.togglePendingDeleteRequest(true);
            this.topicCollection.reset();
            this.topicCollection.sync('delete', this.topicCollection, {
                error: _.bind(this.deleteTopicsError, this),
                success: _.bind(this.topicsDeleted, this)
            });
        },

        deleteTopicsError: function() {
            this.$('.js-config-status').text('There was an error deleting the documents from your index, try again later.');
            this.togglePendingDeleteRequest(false);
        },

        topicsDeleted: function() {
            this.topicCollection.trigger('cleared');
            $('.js-config-status').text('Index successfully cleared.');
            this.togglePendingDeleteRequest(false);
            //resetFileUpload();
        },

        createIndex: function() {
            this.togglePendingCreateRequest(true);
            this.indexModel.save({
                exists: true
            },{
                success: _.bind(this.toggleIndexExistenceMessage, this),
                error: _.bind(this.createIndexError, this)
            });
        },

        createIndexError: function(model, response) {
            // TODO: i18n
            if (response.responseJSON && response.responseJSON.errorCode === 8002) {
                this.$('.js-config-status').text('Looks like your index already exists!');
            } else if (response.responseJSON && response.responseJSON.errorCode === 9000) {
                this.$('.js-config-status').html(
                    'Error: you have reached your index quota. <br><br>' +
                    'You can manage your text indexes in the account section of the <a target="_blank" href="https://www.havenondemand.com">Haven OnDemand website</a>. ' +
                    'You may find there are deprecated NPS indexes, which are no longer compatible ' +
                    'with the latest version of the analysis. You should re-run the analysis and delete ' +
                    'any deprecated indexes if necessary.');
            } else {
                this.$('.js-config-status').text('There was an error creating the index.');
            }
            this.togglePendingCreateRequest(false);
        },

        togglePendingDeleteRequest: function(pending) {
            this.$('.js-delete-topics-icon')
                .toggleClass('fa-circle-o-notch fa-spin', pending)
                .toggleClass('fa-trash-o', !pending);

            this.$('.js-delete-topics').attr('disabled', pending);
        },

        togglePendingCreateRequest: function(pending) {
            this.$('.js-create-index-icon')
                .toggleClass('fa-circle-o-notch fa-spin', pending)
                .toggleClass('fa-files-o', !pending);

            this.$('.js-create-index').attr('disabled', pending);
        },

        toggleIndexExistenceMessage: function(model, response) {
            this.togglePendingCreateRequest(false);

            if(model.get('exists')) {
                this.$('.js-config-status').text('Index successfully created.');
            } else {
                this.createIndexError(model, response);
            }
        }
    });
});
