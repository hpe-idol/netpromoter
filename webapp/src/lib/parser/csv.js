var fs = require('fs');
var _ = require('underscore');
var csvparse = require('csv-parse');
var through2 = require('through2');
var concat = require('concat-stream');


module.exports = function parseCsv(file, callback) {
    callback = _.once(callback);
    var fileStream = fs.createReadStream(file.path);
    var parser = csvparse({ delimiter: ',', skip_empty_lines: true });
    var headers = [];

    parser.on("error", function(err) {
        return callback(err);
    });

    fileStream.pipe(parser).pipe(through2({ objectMode: true }, function(chunk, enc, next) {
        if (headers.length === 0) {
            headers = chunk;
        } else {
            this.push(_.chain(headers).zip(chunk).object().value());
        }
        next();
    })).pipe(concat(function (output) {
        return callback(null,  output);
    }));
};
