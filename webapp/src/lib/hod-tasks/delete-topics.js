var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var logger = require('../services/logger');


module.exports = function (req, callback) {
    logger.log('application', 'Running delete topics task');

    var task = _.partial(hodRequestLib.deleteFromTextIndexPollingService,
        [req.session.domain, nconf.get('havenondemand:nps_index')].join(':'),
        true,
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function(err, response) {
        if(err) return callback(err, response);

        return callback(null, response.result)
    });
};
