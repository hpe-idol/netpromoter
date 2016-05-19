var xlsx = require('xlsx');
var nconf = require('nconf');

module.exports = function(file, callback) {
    try {
        var workbook = xlsx.readFile(file.path, {
            cellFormula: false,
            cellHTML: false,
            sheetRows: nconf.get('parsing:excel_max_rows')
        });
        var content = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        return callback(null, content);
    } catch(e) {
        return callback(e);
    }
};
