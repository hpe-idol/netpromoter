var conf = require('nconf').get('logging');
var fs = require('fs');
var path = require('path');
var util = require('util');

// Only do actual logging work when logging is enabled - otherwise noop.
if (conf.streams.info) {
    module.exports.log = log;
} else {
    module.exports.log = function() {};
}

if (conf.streams.error) {
    module.exports.error = error;
} else {
    module.exports.error = function() {};
}

if (!fs.existsSync(conf.dir)) {
    fs.mkdirSync(conf.dir);
}

/**
 * Log an error message.  Proxies to log() function with 'error' log stream.
 * @param message  The error message to log.
 */
function error(message) {
    log('error', message);
}

/**
 * Log a message
 * @param name  Log stream name, e.g. 'error', 'queries', 'brians-stuff'.  Default is 'application'
 * @param message  The log message, e.g. 'I deleted all of the data, yay'
 */
function log(name, message) {
    // Defaults
    if (!name) {
        name = 'application';
    }

    message = util.format(message); // Convert objects to strings in a sensible way that doesn't give us [Object object]
    message = (new Date()).toUTCString() + ' [' + (name === 'error' ? 'ERROR': 'INFO') + '] ' + message;

    writeToLogFile(name, message);
    consoleEcho(name, message);
}

/**
 * Writes the message to the log file
 * @param name  Log stream name
 * @param message  Log message
 */
function writeToLogFile(name, message) {
    var filename = getLogFileName(name);
    fs.appendFile(filename, message + '\n', function(err) {
        if (err) {
            console.error('Logger is unable to write to log file: ' + filename);
            throw err
        }
    })
}

/**
 * Utility function for generating a log file path from a log stream name
 * @param name  Log stream name
 * @returns {string}  Log file path
 */
function getLogFileName(name) {
    return path.join('.', conf.dir, name + '.log');
}

/**
 * Echo log messages to the console (stdout), if enabled.
 * In addition, error messages (the 'error' log stream name) are *always* echoed to stderr.
 * @param name  Log stream name
 * @param message  Log message
 */
function consoleEcho(name, message) {
    if (conf.echo) {
        console.log('[%s]', name, message);
    }
    if (name == 'error') {
        console.error('[%s]', name, message);
    }
}
