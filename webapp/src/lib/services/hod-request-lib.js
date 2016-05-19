var hodConfig = require('nconf').get('havenondemand');
var HodRequestLib = require('hod-request-lib');
var tokenRepository = require('./token-repository');

module.exports = new HodRequestLib({
    tokenRepository: tokenRepository,
    hodProtocol: hodConfig.protocol,
    hodApiHost: hodConfig.api_host,
    hodPollingLimit: hodConfig.requests.jobStatus.retries,
    hodPollingIntervalMs: hodConfig.requests.jobStatus.retryWaitMs
});
