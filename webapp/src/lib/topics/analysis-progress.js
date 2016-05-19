var websocketEvents = require('../enums').websocketEvents;

var UPLOAD_PROGRESS = 10;

module.exports = AnalysisProgress;

function AnalysisProgress(socket, chunkCount) {
    this.socket = socket;
    this.chunkProgress = (100 - UPLOAD_PROGRESS) / (chunkCount || 1);
    this.progress = 0;

    this._incrementProgress(UPLOAD_PROGRESS);
    this.socket.emit(websocketEvents.parsing.started);
}

AnalysisProgress.prototype._incrementProgress = function (value) {
    this._setProgress(this.progress + value);
};

AnalysisProgress.prototype._setProgress = function (value) {
    this.progress = value;
    this.socket.emit(websocketEvents.analysis.progress, { value: this.progress });
};

AnalysisProgress.prototype.startChunkedAnalysis = function () {
    this.socket.emit(websocketEvents.sentimentAnalysis.started);
};

AnalysisProgress.prototype.error = function () {
    this.socket.emit(websocketEvents.analysis.error);
};

AnalysisProgress.prototype.finish = function () {
    this._setProgress(100);
    this.socket.emit(websocketEvents.analysis.complete);
};

AnalysisProgress.prototype.incrementChunkProgress = function(data, callback) {
    this._incrementProgress(this.chunkProgress / 3);
    return callback(null, data);
};



