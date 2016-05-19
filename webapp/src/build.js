var requirejs = require('requirejs');

var config = {
    baseUrl: 'frontend/js',
    mainConfigFile: 'frontend/js/require-config.js',
    name: 'main',
    out: 'frontend/js/main-built.js',
    findNestedDependencies: true
};

requirejs.optimize(config, console.log, console.log);
