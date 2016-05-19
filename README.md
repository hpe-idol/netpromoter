HPE Net Promoter Score Analytics
==============================

HPE NPS Analytics is a Node.js (express) web application for analysing the free text responses to NPS surveys.  It is built on top of the [Haven OnDemand](https://www.havenondemand.com) platform (v2), leveraging several of the text analytics APIs, particularly sentiment analysis.


Requirements
------------

- Node 0.12.x (but Node 0.10.x will probably work)
- Bower (install it with Node: $ npm install -g bower)
- Redis (see vagrant section below if you need an instance for development)

### Vagrant

Install:
- Vagrant
- Virtualbox
- Librarian-chef


    $ vagrant up

Setup
-----

### Configuration
The default configuration can be found in webapp/src/config.  Some of these defaults must be overridden in a user supplied JSON configuration file.  By default the application will look for this file at webapp/src/config/config.json, but you may change this with a command line argument:

    $ node server.js --hpe-nps-config path/to/config.json

The configuration properties that must be set in your user supplied config are:
- redis
- sessions -> secret
- server -> allowed_origins
- havenondemand -> apikey

E.g. for running the app for development you might have:

    {
        "redis": {
            "host": "netpromoter-backend",
            "port": 6379,
            "sentinels": []
        },
        "sessions": {
          "secret": "superSecretSessionKey"
        },
        "server": {
            "allowed_origins": [
                "http://localhost:8080"
            ]
        },
        "havenondemand": {
            "apikey": "myApplicationApiKey"
        }
    }

### Starting the app
    $ cd webapp/src
    $ npm install
    $ node server.js

Tests
-----
There are currently only a few tests, you can run them with the below.  Expanding on these will be an ongoing priority.

    $ cd webapp/src
    $ npm test


Coverage
--------
Coverage is provided by Istanbul and reports will be under /coverage.

    $ cd webapp/src
    $ npm run coverage

Gotchas
-------
The application uses Haven OnDemand SSO for authentication, however Haven OnDemand maintains a whitelist of domains that it will redirect to during the SSO process.  If you find that you are being redirected to the Haven OnDemand homepage during the SSO process, then this is likely to be the cause.
