var async = require('async');
var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var logger = require('../services/logger');
var enums = require('../enums');
var hodEnums = require('hod-request-lib').enums;

module.exports = function (concept, fieldText, req, callback) {
    logger.log('application', 'Running query topic concepts task');

    var task = _.partial(hodRequestLib.queryTextIndexSync,
        concept,
        {
            maxResults: hodEnums.queryResultsLimit,
            fieldText: fieldText,
            indexes: [req.session.domain, nconf.get('havenondemand:nps_index')].join(':'),
            maxPageResults: hodEnums.queryResultsLimit,
            print: hodEnums.queryPrintOptions.fields,
            printFields: [
                'nps_type',
                'score',
                'sentiment',
                'sentimenttext',
                'answer',
                'content',
                'date',
                'survey_id',
                'reference'
            ],
            totalResults: true
        },
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function(err, queryResponse) {
        if(err) return callback(err);

        if (!_.has(queryResponse, 'result')) {
            return callback(new Error('No result found in query response.'));
        }

        return callback(null, deduplicateTopics(queryResponse))
    });
};

function deduplicateTopics(queryResponse) {
    var answerGroupedDocs = _.groupBy(queryResponse.result.documents, function(doc) {
        return doc.survey_id && doc.survey_id[0];
    });

    // Allow backwards compatibility - return early if our grouping contains
    // undefined (i.e. there is a doc without a survey_id in the results)
    if(_.contains(_.keys(answerGroupedDocs), undefined)) {
        return queryResponse.result.documents;
    }

    var removeByReference = function(array, ref) {
        array.splice(_.findIndex(array, function(doc) {
            return doc.reference === ref;
        }), 1);

        return array;
    };

    var removeReferences = function(array, refs) {
        if(refs.length >= 1) {
            return removeReferences(removeByReference(array, refs.pop()), refs);
        } else {
            return array;
        }
    };

    // If topic is from the same answer, then remove the topics without sentiment to avoid dupes
    return _.chain(answerGroupedDocs)
        .map(function(docs) {
            if(docs.length > 1) {
                var sentimentGroupedDocs = _.groupBy(docs, function(doc) {
                    return doc.sentiment[0];
                });

                var positiveCount = sentimentGroupedDocs[enums.sentiments.positive] && sentimentGroupedDocs[enums.sentiments.positive].length;
                var negativeCount = sentimentGroupedDocs[enums.sentiments.negative] && sentimentGroupedDocs[enums.sentiments.negative].length;
                var noneCount = sentimentGroupedDocs[enums.sentiments.none] && sentimentGroupedDocs[enums.sentiments.none].length;

                if(noneCount && (positiveCount || negativeCount)) {
                    return removeReferences(docs, _.pluck(sentimentGroupedDocs[enums.sentiments.none], 'reference'));
                }
            }

            return docs;
        })
        .flatten()
        .value();
}
