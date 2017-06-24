'use strict';

const express = require('express');
const app     = express();
const server  = require('http').createServer(app);
const io      = require('socket.io')(server);

const redis   = require('socket.io-redis');

io.adapter(redis({
    'key': 'foobar',
    'host': 'localhost',
    'port': 6379,
    'requestsTimeout': 2000
}));

io.on('connection', function (connection) {
    console.log(`server: connection ${connection.id}`);

    connection.on('disconnect', (data) => {
        console.log('server: disconnection');
    });

    // We simply pass the data back
    connection.on('echo', (data) => {
        connection.emit('echo', data);
    });
});

server.listen(3000, function () {
    console.log('listening on *:3000');
});

exports.serverIO = io;
