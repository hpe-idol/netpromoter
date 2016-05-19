var getPath = require('../utils/get-path-safe');
var xlsx = require('./xlsx');
var csv = require('./csv');

var acceptFileNames = /\.csv|xlsx|xls$/i;
var acceptFilesTypes = /^application\/csv|text\/csv|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet$/i;
var fileTypeExtension = /\.([a-z]+)$/i;

var parsers = {
    csv: csv,
    xlsx: xlsx,
    xls: xlsx
};


exports.getContent = function(file, req, callback) {
    if(!validateFileName(file) || !validateFileContentType(file)) {
        return callback(new Error('File failed name or content type validation.'))
    } else {
        var extension = fileTypeExtension.exec(file.originalFilename)[1];
        return parsers[extension](file, callback);
    }
};

function validateFileName(file) {
    return acceptFileNames.test(file.originalFilename);
}

function validateFileContentType(file) {
    return acceptFilesTypes.test(getPath(file, 'headers.content-type'));
}
