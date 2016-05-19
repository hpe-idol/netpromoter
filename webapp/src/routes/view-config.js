var _ = require('underscore');

var enums = require('../lib/enums');
var messages = require('../lib/messages');

function getMessage() {
    return _.chain(messages.statusMessages)
        .filter(function(message) {
            return message.expiry > Date.now();
        })
        .sortBy('id')
        .last()
        .value();
}

module.exports = function getConfig() {
    var message = getMessage();
    return {
        websocketEvents: enums.websocketEvents,
        infoMessage: message && message.messageHtml
    }
};
