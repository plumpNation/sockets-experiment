'use strict';

const io = require('socket.io-client');

const options = {
    'transports': ['websocket'],
    'force new connection': true
};

const client = io.connect("http://localhost:3000", options);

client.once('connect', function () {
    console.log('client connected');

    client.once('echo', function (message) {
        if ('Hello World' === message) {
            console.log('test passed');
        }

        console.log('disconnecting');
        client.disconnect();
    });

    console.log('Sending test message', '"Hello World"');
    client.emit('echo', 'Hello World');
});
