var async = require('async');
var _ = require('underscore');
var nconf = require('nconf');

var logger = require('./logger');

var q = async.queue(function (queueTask, callback) {
    logger.log('application', 'Added request to queue');

    queueTask(function (err, result) {
        if (err) {
            logger.error(err.message);
            return callback(err, result);
        }
        return callback(null, result);
    });

}, nconf.get('apiQueue:length'));

q.drain = function () {
    logger.log('application', 'The request queue is now empty');
};

exports.queueAsyncTask = function (task, callback) {
    q.push(task, callback);
};