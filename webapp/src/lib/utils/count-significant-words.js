/*
    Count the number of words in a given string (of length greater than 1)
 */
module.exports = function (s) {
    s = s.replace(/\b\S\b/,''); // exclude single character words
    s = s.replace(/(^\s*)|(\s*$)/gi,'');//exclude  start and end white-space
    s = s.replace(/[ ]{2,}/gi,' ');//2 or more space to 1
    s = s.replace(/\n /,'\n'); // exclude newline with a start spacing
    return s.split(' ').length;
};
