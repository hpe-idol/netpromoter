/*
    Split one array into multiple array "chunks" of a given size
 */
module.exports = function (array, chunkSize) {
    var i, j;
    var chunkedArray = [];

    for (i = 0, j = array.length; i < j; i += chunkSize) {
        chunkedArray.push(array.slice(i, i + chunkSize));
    }

    return chunkedArray
};
