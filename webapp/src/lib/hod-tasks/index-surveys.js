var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var logger = require('../services/logger');
var enums = require('../enums');
var calc = require('../utils/nps-calculator');


module.exports = function (surveys, req, callback) {
    logger.log('application', 'Running index surveys task');

    var docs = _.map(surveys, formatSurveyDocument);
    var docsForIod = { document: docs };

    var task = _.partial(hodRequestLib.addJsonToTextIndexPollingService,
        [req.session.domain, nconf.get('havenondemand:nps_index')].join(':'),
        JSON.stringify(docsForIod),
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function (err) {
        if (err) return callback(err, null);

        return callback(null, _.pluck(surveys, 'answer'));
    });
};

function formatSurveyDocument(survey) {
    return {
        survey_id: survey.surveyId, // The ID of the survey response
        question: survey.question, // The ID of the question being answered
        nps_type: calc.categorize(survey.score), // The NPS category of this user's response
        score: survey.score, // The NPS score for question 1 ("On a scale of 1-10...")
        sentiment: enums.sentiments.none, // The sentiment (positive/negative) of the response
        content: survey.answer, // The topic of the sentiment found in the survey response
        date: survey.date // The date the survey was taken
    }
}
