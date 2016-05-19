var nconf = require('nconf');

//Config source priority
// 1 - overrides file
// 2 - argv
// 3 - env
// 4 - user-supplied file
// 5 - default file

nconf
    .file('overrides', __dirname + '/overrides-config.json')
    .argv()
    .env();

var env = nconf.get('NODE_ENV') || 'development';
nconf.set('NODE_ENV', env);

var configLocation = nconf.get('hpe-nps-config') || __dirname + '/config.json';

nconf.file('user', configLocation);
nconf.file('default', __dirname + '/default-config.json');

module.exports = nconf;
