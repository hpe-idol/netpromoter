var _ = require('underscore');
var nconf = require('nconf');

var hodRequestLib = require('../services/hod-request-lib');
var apiQueue = require('../services/api-queue');
var hodEnums = require('hod-request-lib').enums;

module.exports = function (req, callback) {

    var task = _.partial(hodRequestLib.listResourcesSync,
        {
            flavor: hodEnums.resourceFlavors.customFields,
            type: hodEnums.resourceTypes.content
        },
        req.session.tokenProxy
    );

    apiQueue.queueAsyncTask(task.bind(hodRequestLib), function (err, response) {
        if (err || !_.has(response.result, 'private_resources')) {
            return callback(err, null);
        }
        var indexes = _.pluck(response.result.private_resources, 'resource');
        return callback(err, { exists: _.contains(indexes, nconf.get('havenondemand:nps_index')) });
    });
};