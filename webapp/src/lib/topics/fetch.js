var async = require('async');
var _ = require('underscore');

var hodTasks = require('../hod-tasks/index');
var enums = require('../enums');


module.exports = function getTopicGroupings(fieldText, sentiment, wordLimit, req, callback) {
    var dedupeRequired = sentiment && enums.sentiments[sentiment];

    function getGroupingModel(text, occurrences) {
        return {
            text: text,
            occurrences: occurrences
        }
    }

    function prepareResults(concept, callback) {
        // If sentiment is defined then we have no need to dedupe the results
        if(dedupeRequired) return callback(null, getGroupingModel(concept.text, concept.docs_with_phrase));

        hodTasks.queryTopicConcepts('"' + concept.text + '"', fieldText, req, function(err, results) {
            if(err) return callback(err);
            return callback(null, getGroupingModel(concept.text, results.length));
        });
    }

    async.waterfall([
        async.constant(fieldText, wordLimit, req),
        hodTasks.findRelatedTopics,
        _.partial(async.map, _, prepareResults)
    ], function(err, topics) {
        return callback(err, _.sortBy(topics, 'occurrences').reverse());
    });
};
