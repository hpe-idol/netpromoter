var viewConfig = require('./view-config');


exports.analysis = function(req, res) {
    res.render('analysis', {
        configJson: JSON.stringify(viewConfig())
    });
};
