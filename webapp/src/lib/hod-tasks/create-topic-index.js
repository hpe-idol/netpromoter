var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var logger = require('../services/logger');
var hodEnums = require('hod-request-lib').enums;


module.exports = function (req, callback) {
    logger.log('application', 'Running create topic index task');

    var task = _.partial(hodRequestLib.createTextIndexPollingService,
        nconf.get('havenondemand:nps_index'),
        hodEnums.resourceFlavors.customFields,
        {
            parametric_fields: [
                'question',
                'nps_type',
                'sentiment',
                'survey_id'
            ],
            numeric_fields: [
                'score',
                'nps_indexing_version'
            ]
        },
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function(err, response) {
        if(err) return callback(err, response);

        return callback(null, { exists: response.result })
    });
};
