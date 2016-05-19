var async = require('async');
var nconf = require('nconf');
var multiparty = require('multiparty');
var _ = require('underscore');

var ws = require('../lib/services/websocket');
var logger = require('../lib/services/logger');
var hodTasks = require('../lib/hod-tasks');
var analyseFile = require('../lib/topics/analysis');
var AnalysisProgress = require('../lib/topics/analysis-progress');
var fetchTopics = require('../lib/topics/fetch');
var enums = require('../lib/enums');
var hodEnums = require('hod-request-lib').enums;
var getPath = require('../lib/utils/get-path-safe');

function getTopicFieldText(query) {

    // TODO: field text lib
    var fieldText = "MATCH{" + enums.analysisQuestions[query.question] + "}:question";

    if (query.npsType && enums.npsTypes[query.npsType]) {
        fieldText += " AND MATCH{" + enums.npsTypes[query.npsType] + "}:nps_type";
    }

    if (query.sentiment && enums.sentiments[query.sentiment]) {
        fieldText += " AND MATCH{" + enums.sentiments[query.sentiment] + "}:sentiment";
    }

    return fieldText;
}

function apiCallback(res) {
    return function(err, result) {
        if (err) {
            var errorCode = getPath(result, 'errorCode');
            if(errorCode) {
                res.status(500).send({
                    message: getPath(result, 'error.message'),
                    errorCode: errorCode
                });
            } else {
                res.status(500).send(err);
            }
        }
        else {
            res.send(result);
        }
    }
}

exports.getTopicGroupings = function(req, res) {
    var wordLimit = req.query.excludeSingle !== 'false' ? 1 : 0;
    fetchTopics(getTopicFieldText(req.query), req.query.sentiment, wordLimit, req, apiCallback(res));
};

exports.getTopicDocuments = function(req, res) {
    hodTasks.queryTopicConcepts(req.query.concept, getTopicFieldText(req.query), req, apiCallback(res));
};

exports.checkIndex = function(req, res) {
    hodTasks.checkIndexExists(req, apiCallback(res));
};

exports.createIndex = function(req, res) {
    hodTasks.createTopicIndex(req, apiCallback(res));
};

exports.deleteFromIndex = function(req, res) {
    hodTasks.deleteTopics(req, apiCallback(res));
};

exports.surveyUpload = function(req, res) {
    logger.log('application', 'upload request received');

    new multiparty.Form({
        maxFilesSize: 10 * 1024 * 1024
    }).parse(req, function (err, fields, files) {
        if (err) {
            res.status(err.status).end({ message: 'Error occurred while trying to upload the file.' });
        } else {
            res.status(200).send({ message: 'Upload complete, starting analysis' });
            var socket = ws.get(fields.socketid);
            var language = hodEnums.sentimentLanguages[fields.language] || hodEnums.sentimentLanguages.english;

            return analyseFile(files.files[0], language, socket, req, function(err, progress) {
                progress = progress || new AnalysisProgress(socket);
                if (err) {
                    logger.error('Failed somewhere when uploading survey responses with error: ' + err);
                    progress.error();
                } else {
                    logger.log('application', 'Successfully uploaded, analysed and indexed survey responses');
                    progress.finish();
                }
            });
        }
    });
};
