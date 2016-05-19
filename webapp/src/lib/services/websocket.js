var logger = require('./logger');
var socketio = require('socket.io');

var sockets = {};

exports.initialize = function (server) {
    var io = socketio.listen(server);

    io.on('connection', function (socket) {
        sockets[socket.id] = socket;
        logger.log('application', 'Socket established with client');

        socket.on('disconnect', function () {
            delete sockets[socket.id];
        })
    })
};

exports.get = function(socketId) {
    return sockets[socketId] || { emit: function() {} };
};
