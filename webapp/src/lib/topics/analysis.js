var async = require('async');
var _ = require('underscore');

var parser = require('../parser');
var hodTasks = require('../hod-tasks/index');
var chunkArray = require('../utils/chunk-array');
var AnalysisProgress = require('./analysis-progress');
var transformContent = require('../transform/content');

var CHUNK_SIZE = 50;


module.exports = function analyseFile(file, language, socket, req, callback) {

    function analyseContent(content, callback) {
        var surveyModels = transformContent.toSurveys(content);
        var chunksOfSurveys = chunkArray(surveyModels, CHUNK_SIZE);
        var progress = new AnalysisProgress(socket, chunksOfSurveys.length);

        return analyseSurveys(chunksOfSurveys, language, progress, req, callback);
    }

    async.waterfall([
        async.constant(file, req),
        parser.getContent,
        analyseContent
    ], callback);
};

function analyseSurveys(chunksOfSurveys, language, progress, req, callback) {
    progress.startChunkedAnalysis();
    var chunkProgress = progress.incrementChunkProgress.bind(progress);

    function analyseChunk(surveyModels, callback) {
        async.waterfall([

            _.partial(hodTasks.indexSurveys, surveyModels, req),
            chunkProgress,
            _.partial(hodTasks.analyzeSentiment, _, language, surveyModels, req),
            chunkProgress,
            _.partial(hodTasks.indexTopics, _, req),
            chunkProgress

        ], callback);
    }

    async.map(chunksOfSurveys, analyseChunk, function(err, results) {
        if (err) {
            callback(err, progress);
        } else if(!results) {
            callback(new Error('No results found during topic analysis.'), progress);
        } else {
            callback(null, progress);
        }
    });
}
