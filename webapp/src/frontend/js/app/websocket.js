define([
    'socket.io',
    'app/config'
], function(io, config) {
    return {
        socket: io(window.location.origin),

        events: config().websocketEvents
    };
});