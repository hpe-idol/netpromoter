var _ = require('underscore');
var uuid = require('node-uuid');

var enums = require('../enums');

var WHY_FIELD_NAME = 'why';
var IMPROVE_FIELD_NAME = 'improve';
var SCORE_FIELD_NAME = 'nps';

var questions = [
    enums.analysisQuestions.recommend,
    enums.analysisQuestions.improve
];

var commentFields = {};
commentFields[enums.analysisQuestions.recommend] = WHY_FIELD_NAME;
commentFields[enums.analysisQuestions.improve] = IMPROVE_FIELD_NAME;


exports.toSurveys = function(content) {
    var extract = extractResponsesFromRow(uuid.v4());

    return _.chain(content)
        .map(extract)
        .flatten()
        .value();
};

function extractResponsesFromRow(surveyUuid) {
    return function(row, responseId) {
        var commentFields = getCommentFields(row);
        var scoreField = identifyScoreField(row);
        var score = row[scoreField];
        var metaDataFields = _.omit(row, _.union(commentFields, scoreField));
        var build = buildSingleSurveyModels(surveyUuid, row, score, metaDataFields, responseId);

        return _.chain(commentFields)
            .map(build)
            .compact()
            .value();
    }
}

function buildSingleSurveyModels(surveyUuid, row, score, metaDataFields, responseId) {
    return function(field, index) {
        if (score && field) {
            return _.defaults({
                surveyId: [surveyUuid, responseId, index].join('-'),
                question: questions[index],
                score: score,
                answer: row[field],
                date: Date.now()
            }, metaDataFields);
        }
    }
}

function identifyField(row, name) {
    return _.chain(row)
        .pick(function(value, key) {
            return key.toLowerCase().trim() === name;
        })
        .keys()
        .first()
        .value();
}

function getCommentFields(row) {
    return _.map(questions, function(question) {
        return identifyField(row, commentFields[question]);
    });
}

var identifyScoreField = _.partial(identifyField, _, SCORE_FIELD_NAME);
