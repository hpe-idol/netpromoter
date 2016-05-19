var RedisClient = require('ioredis');
var nconf = require('nconf');

var redisClient;

if(nconf.get('redis:sentinels') && nconf.get('redis:sentinels').length) {
    redisClient = new RedisClient({
        sentinels: nconf.get('redis:sentinels'),
        name: nconf.get('redis:master'),
        db: nconf.get('redis:database') || 0
    });
} else {
    redisClient = new RedisClient({
        port: nconf.get('redis:port'),
        host: nconf.get('redis:host'),
        db: nconf.get('redis:database') || 0
    });
}

module.exports = redisClient;
