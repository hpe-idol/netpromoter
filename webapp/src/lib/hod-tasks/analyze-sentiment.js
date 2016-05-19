var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var ensureArray = require('../utils/ensure-array');
var logger = require('../services/logger');
var transformSentiment = require('../transform/sentiment');


module.exports = function (text, language, surveyModels, req, callback) {
    logger.log('application', 'Running analyze sentiment task');

    // add some default text if no answer given as sentiment analysis
    // ignores empty strings when returning the documentIndex
    text = _.map(ensureArray(text), function(answer) {
        if (!answer) {
            answer = 'x'
        }
        return answer
    });

    var task = _.partial(
        hodRequestLib.analyzeSentimentPollingService,
        text,
        language,
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function(err, response) {
        if(err) return callback(err, response);

        return callback(null, transformSentiment.toTopicDocuments(surveyModels, response.result))
    });
};
