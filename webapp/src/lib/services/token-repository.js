var RedisTokenRepository = require('redis-hod-token-repository');
var redis = require('./redis');


module.exports = new RedisTokenRepository({
    redis: redis
});
