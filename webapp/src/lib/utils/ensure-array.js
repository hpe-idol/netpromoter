var _ = require('underscore');

module.exports = function(value) {
    if(_.isArray(value)) {
        return value
    } else if(value) {
        return [value]
    } else {
        return []
    }
};
