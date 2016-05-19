define([
    'backbone',
    'handlebars',
    'app/websocket',
    'app/models/upload-progress-model',
    'text!templates/app/page/analysis/upload/upload-controls.hbs',
    'jquery.ui.widget',
    'jquery.iframe-transport',
    'jquery.fileupload'
], function(Backbone, Handlebars, websocket, UploadProgressModel, template) {
    return Backbone.View.extend({

        events: {
            'click .js-filename-remove': function() {
                this.uploadProgressModel.set('uploadState', UploadProgressModel.UploadState.EMPTY);
            },
            'click .js-add-file': function() {
                this.$('.js-upload-input').click();
            },
            'change .js-language-select': function(e) {
                this.fileUploadModel.set({
                    language: e.result
                });
            },
            'click .js-upload-file': 'submitUpload'
        },

        initialize: function(options) {
            this.template = Handlebars.compile(template);

            this.fileUploadModel = options.fileUploadModel;
            this.uploadProgressModel = options.uploadProgressModel;
            this.indexModel = options.indexModel;

            this.listenTo(this.uploadProgressModel, 'change:uploadState', this.updateLoading);
            this.listenTo(this.fileUploadModel, 'change:data', this.updateFile);

            websocket.socket.on('connect', _.bind(function() {
                this.fileUploadModel.set('socketId', websocket.socket.id);
            }, this));
        },

        render: function() {
            this.$el.html(this.template());

            this.fileUploadModel.set('language', this.$('.js-language-select').val());

            this.$('.js-upload-input').fileupload({
                url: 'api/survey',
                dataType: 'json',
                replaceFileInput: false,
                add: _.bind(this.addFileToUploadInput, this),
                fail: _.bind(this.uploadError, this)
            });
        },

        addFileToUploadInput: function(e, data) {
            this.clearUpload(); // Remove any previous file upload
            this.fileUploadModel.set('data', data);

            if(this.fileUploadModel.isValid()) {
                if(!this.uploadProgressModel.isInProgress()) {
                    this.uploadProgressModel.set('uploadState', UploadProgressModel.UploadState.READY);
                }
            } else {
                this.uploadProgressModel.set({
                    uploadState: UploadProgressModel.UploadState.ERROR,
                    errorMessage: this.fileUploadModel.validationError
                });
            }
        },

        updateLoading: function(model, uploadState) {
            var inProgress = model.isInProgress();

            this.$('.js-upload-file-icon')
                .toggleClass('fa-circle-o-notch fa-spin', inProgress)
                .toggleClass('fa-cloud-upload', !inProgress);

            this.$('.js-add-file').prop('disabled', inProgress);
            this.$('.js-filename-remove').toggleClass('hide', inProgress);

            if(uploadState === UploadProgressModel.UploadState.EMPTY) {
                this.clearUpload();
            } else if(uploadState === UploadProgressModel.UploadState.READY) {
                this.togglePermitUpload(true);
            }
        },

        updateFile: function(model, data) {
            var filename = (data && data.files[0].name) || '';
            this.$('.js-upload-filename').text(filename);
            this.$('.js-filename-remove').toggleClass('hide', !filename);
        },

        submitUpload: function() {
            this.uploadProgressModel.set('uploadState', UploadProgressModel.UploadState.UPLOADING);
            this.$('.js-upload-file').prop('disabled', true);
            this.$('.js-filename-remove').addClass('hide');

            this.indexModel.fetch({
                success: _.bind(function(model) {
                    if(model.get('exists')) {
                        this.fileUploadModel.save();
                    } else {
                        this.uploadProgressModel.set({
                            uploadState: UploadProgressModel.UploadState.ERROR,
                            errorMessage: 'Error: The required text index does not exist. Try creating it in step 1.\n\nYou may occasionally receive this error if we have recently updated the algorithm and your index requires recreating.'
                        });
                    }
                }, this),
                error: _.bind(function() {
                    this.uploadProgressModel.set({
                        uploadState: UploadProgressModel.UploadState.ERROR,
                        errorMessage: 'Error occurred while checking for the required text index.'
                    });
                }, this)
            });
        },

        clearUpload: function() {
            this.togglePermitUpload(false);
            this.$('.js-upload-filename').text('');
            this.$('.js-filename-remove').addClass('hide');

            // reset form appears to be the sanest way to remove all files from the input
            // don't ask me why there is no remove/clear method for the upload plugin
            var form = this.$('.js-fileupload-form');
            form.wrap('<form>').closest('form').get(0).reset();
            form.unwrap();
        },

        togglePermitUpload: function(permit) {
            this.$('.js-upload-file').prop('disabled', !permit);
        },

        uploadError: function(e, data) {
            var errorMessage = data.jqXHR.status === 413 ?
                'Error: file size limit (10MB) exceeded.':
                'Error occurred while uploading data.';

            this.uploadProgressModel.set({
                uploadState: UploadProgressModel.UploadState.ERROR,
                errorMessage: errorMessage
            });
        }
    });
});

