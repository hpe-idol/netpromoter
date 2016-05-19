var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var logger = require('../services/logger');
var countWords = require('../utils/count-significant-words');

module.exports = function (fieldText, wordLimit, req, callback) {
    logger.log('application', 'Running find related topics task');

    var task = _.partial(hodRequestLib.findRelatedConceptsSync,
        [req.session.domain, nconf.get('havenondemand:nps_index')].join(':'),
        {
            fieldText: fieldText,
            sampleSize: 10000,
            maxResults: 80
        },
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function (err, response) {
        if (err) return callback(err);

        if (!_.has(response.result, 'entities')) {
            return callback(new Error('No entities found.'));
        }

        return callback(err, pickBestTopics(response.result.entities, wordLimit));
    });
};


/*
    Pick the top 10 most frequently occurring concepts in our topics after
    excluding topics of only one word and excluding duplicates (identified by cluster)
*/
function pickBestTopics(entities, wordLimit) {
    return _.chain(entities)
        .reject(conceptBelowWordLimit(wordLimit))
        .groupBy('cluster')
        .map(deduplicateCluster)
        .flatten()
        .sortBy('docs_with_phrase')
        .last(10)
        .value()
        .reverse();
}

function conceptBelowWordLimit(wordLimit) {
    return function(concept) {
        return countWords(concept.text) <= wordLimit;
    };
}

function deduplicateCluster(topics, cluster) {
    if(cluster < 0) return topics;

    var max = _.max(_.pluck(topics, 'docs_with_phrase'));
    return _.findWhere(topics, { docs_with_phrase: max });
}
