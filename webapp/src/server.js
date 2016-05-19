var express = require('express');
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var http = require('http');
var _ = require('underscore');
var ssoRouter = require('express-hod-sso');

var nconf = require('./config');
var logger = require('./lib/services/logger');
var socket = require('./lib/services/websocket');
var redis = require('./lib/services/redis');
var hodRequestLib = require('./lib/services/hod-request-lib');
var tokenRepository = require('./lib/services/token-repository');
var apiRoutes = require('./routes/api');
var viewRoutes = require('./routes/views');

var WEBSERVER_DIR = __dirname + nconf.get('server:public_dir');
var version = process.env.npm_package_version || (new Date()).getTime();

var app = express();

var hbs = handlebars.create({
    helpers: {
        optimizedSuffix: function() {
            return (nconf.get('NODE_ENV') == 'production' ? '-built' : '') + '.js?v' + version;
        },
        versionSuffix: function () {
            return version;
        },
        getHeaderPartial: function(viewName) {
            return 'head/' + viewName;
        }
    },
    extname: 'hbs',
    defaultLayout: 'main'
});

// View engine
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// Express Middleware stack goes here

// Redis express session handling
app.set('trust proxy', nconf.get('sessions:cookie:secure'));
app.use(session({
    store: new RedisStore({
        client: redis,
        ttl: nconf.get('sessions:ttl')
    }),
    secret: nconf.get('sessions:secret'),
    cookie: {
        maxAge: nconf.get('sessions:cookie:max_age'),
        secure: nconf.get('sessions:cookie:secure')
    },
    saveUninitialized: true,
    resave: true
}));

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(require('serve-favicon')(WEBSERVER_DIR + 'img/favicon-hpe.ico'));
app.use(express.static(WEBSERVER_DIR));
app.use(ssoRouter(nconf.get('havenondemand:apikey'), {
    hodApiHost: nconf.get('havenondemand:api_host'),
    hodSsoPage: nconf.get('havenondemand:sso_page'),
    allowedOrigins: nconf.get('server:allowed_origins'),
    hodRequestLib: hodRequestLib,
    tokenRepository: tokenRepository
}));

// Attach routes
var apiRouter = express.Router();
apiRouter.get('/groupings', apiRoutes.getTopicGroupings);
apiRouter.delete('/topics', apiRoutes.deleteFromIndex);
apiRouter.get('/topics', apiRoutes.getTopicDocuments);
apiRouter.get('/index', apiRoutes.checkIndex);
apiRouter.post('/index', apiRoutes.createIndex);
apiRouter.post('/survey', apiRoutes.surveyUpload);
app.use('/api', apiRouter);

// Attach routes for views
// Error/SSO views attached by SSO middleware
var viewRouter = express.Router();
viewRouter.get('/', viewRoutes.analysis);
viewRouter.get('/analysis', viewRoutes.analysis);
app.use(viewRouter);

var port = nconf.get("PORT") || nconf.get('server:port');
server = app.listen(port);
socket.initialize(server);

logger.log("application", "Starting NPS Express server on " + port);
