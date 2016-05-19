define([
    'backbone',
    'jquery',
    'handlebars',
    'app/models/upload-progress-model',
    'app/models/file-upload-model',
    'app/page/analysis/upload/upload-controls',
    'text!templates/app/page/analysis/upload/upload-panel.hbs'
], function(Backbone, $, Handlebars, UploadProgressModel, FileUploadModel, UploadControlsView, template) {

    var uploadStateMessages = {};
    uploadStateMessages[UploadProgressModel.UploadState.EMPTY] = '';
    uploadStateMessages[UploadProgressModel.UploadState.READY] = '';
    uploadStateMessages[UploadProgressModel.UploadState.UPLOADING] = 'Uploading...';
    uploadStateMessages[UploadProgressModel.UploadState.PARSING] = 'Parsing uploaded content...';
    uploadStateMessages[UploadProgressModel.UploadState.ANALYSIS] = 'Analyzing the sentiments in your survey and indexing...';
    uploadStateMessages[UploadProgressModel.UploadState.FINISHED] = 'Upload, analysis and indexing complete.  Your results are ready to be viewed.';

    return Backbone.View.extend({

        initialize: function(options) {
            this.template = Handlebars.compile(template);
            this.model = options.uploadProgressModel;
            this.topicCollection = options.topicCollection;
            var fileUploadModel = new FileUploadModel();

            this.uploadControlsView = new UploadControlsView({
                fileUploadModel: fileUploadModel,
                uploadProgressModel: options.uploadProgressModel,
                indexModel: options.indexModel
            });

            this.listenTo(this.model, 'change:uploadState', _.bind(this.updateLoading, this));
            this.listenTo(this.model, 'change:progress', _.bind(this.updateProgress, this));
            this.listenTo(this.topicCollection, 'cleared', _.bind(this.clearUpload, this));
            this.listenTo(fileUploadModel, 'invalid', _.bind(this.validationError, this));
        },

        render: function() {
            this.$el.html(this.template());

            this.uploadControlsView.setElement(this.$('.js-upload-controls')).render();
        },

        clearUpload: function() {
            this.model.set('uploadState', UploadProgressModel.UploadState.EMPTY);
        },

        updateLoading: function(model, uploadState) {
            if(_.has(uploadStateMessages, uploadState)) {
                this.updateStatus(model, uploadStateMessages[uploadState]);
            }

            if(uploadState === UploadProgressModel.UploadState.ERROR) {
                this.updateStatus(model, model.get('errorMessage') || 'Error occurred while uploading data.');
            }

            if(uploadState === UploadProgressModel.UploadState.READY || uploadState === UploadProgressModel.UploadState.EMPTY) {
                this._setProgress(0);
            }
        },

        updateProgress: function(model, progress) {
            if(model.isInProgress()){
                this._setProgress(progress);
            }
        },

        updateStatus: function(model, message) {
            if(model.wasInProgress() ||
                model.get('uploadState') === UploadProgressModel.UploadState.EMPTY ||
                model.get('uploadState') === UploadProgressModel.UploadState.READY ||
                model.get('uploadState') === UploadProgressModel.UploadState.UPLOADING
            ){
                this.$('.js-upload-status').text(message)
            }
        },

        _setProgress: function(progress) {
            this.$('.progress-bar')
                .css('width', progress + '%')
                .attr('aria-valuenow', progress);
        },

        validationError: function(model, error) {
            this.$('.js-upload-status').text(error);
        }
    });
});
