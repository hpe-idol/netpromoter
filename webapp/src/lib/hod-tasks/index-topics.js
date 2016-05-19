var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var logger = require('../services/logger');


module.exports = function (docs, req, callback) {
    if(!docs.document.length) return callback(null, '');

    logger.log('application', 'Running index topics task');

    var task = _.partial(hodRequestLib.addJsonToTextIndexPollingService,
        [req.session.domain, nconf.get('havenondemand:nps_index')].join(':'),
        JSON.stringify(docs),
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function(err, response) {
        if(err) return callback(err, response);

        return callback(null, response.result)
    });
};
