define([
    'backbone',
    'app/websocket'
], function(Backbone, websocket) {

    var UploadState = {
        EMPTY: 'EMPTY',
        READY: 'READY',
        UPLOADING: 'UPLOADING',
        PARSING: 'PARSING',
        ANALYSIS: 'ANALYSIS',
        FINISHED: 'FINISHED',
        ERROR: 'ERROR'
    };

    function modelInProgress(modelAttributes) {
        return modelAttributes.uploadState === UploadState.UPLOADING ||
            modelAttributes.uploadState === UploadState.PARSING ||
            modelAttributes.uploadState === UploadState.ANALYSIS;
    }

    return Backbone.Model.extend({

        defaults: {
            uploadState: UploadState.EMPTY,
            progress: 0
        },

        initialize: function() {
            websocket.socket.on(websocket.events.analysis.complete, _.bind(this.onComplete, this));
            websocket.socket.on(websocket.events.analysis.error, _.bind(this.set, this, 'uploadState', UploadState.ERROR));
            websocket.socket.on(websocket.events.analysis.progress, _.bind(this.onProgress, this));
            websocket.socket.on(websocket.events.parsing.started, _.bind(this.set, this, 'uploadState', UploadState.PARSING));
            websocket.socket.on(websocket.events.sentimentAnalysis.started, _.bind(this.set, this, 'uploadState', UploadState.ANALYSIS));
        },

        onComplete: function() {
            this.set({
                uploadState: UploadState.FINISHED,
                progress: 100
            });
        },

        onProgress: function(data) {
            this.set('progress', data.value)
        },

        isInProgress: function() {
            return modelInProgress(this.attributes);
        },

        wasInProgress: function() {
            return modelInProgress(this.previousAttributes())
        },

        reset: function() {
            this.set({
                uploadState: UploadState.EMPTY,
                progress: 0
            });
        }

    }, {
        UploadState: UploadState
    });
});
