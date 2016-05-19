var _ = require('underscore');
var nconf = require('nconf');

var calc = require('../utils/nps-calculator');
var ensureArray = require('../utils/ensure-array');

exports.toTopicDocuments = function (surveys, sentiments) {
    var buildTopicDocument = formatSingleTopicDocument(surveys);

    var topicDocs = _.chain(sentiments.positive)
        .union(sentiments.negative)
        .map(buildTopicDocument)
        .reject(badDocPredicate)
        .value();

    return {
        document: ensureArray(topicDocs)
    };
};

function badDocPredicate(doc) {
    return !_.isString(doc.content) || !_.isString(doc.sentimentText);
}

function formatSingleTopicDocument(surveys) {
    return function(sentiment) {
        // Sentiment analysis doesn't return a document index for single text requests, so default to 0
        var survey = surveys[sentiment.documentIndex || 0];

        return {
            nps_indexing_version: nconf.get('nps_index_compatibility_version'),
            survey_id: survey.surveyId, // The ID of the survey response
            question: survey.question, // The ID of the question being answered
            nps_type: calc.categorize(survey.score), // The NPS category of this user's response
            score: survey.score, // The NPS score for question 1 ("On a scale of 1-10...")
            sentiment: calc.categorizeSentiment(sentiment.score), // The sentiment (positive/negative) of the response
            sentimentText: sentiment.sentiment || sentiment.normalized_text, // The actual text of the sentiment (eg. "very good")
            content: sentiment.topic, // The topic of the sentiment found in the survey response
            answer: survey.answer, // The full answer to the survey question
            date: survey.date // The date the survey was taken
        }
    };
}