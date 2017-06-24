'use strict';

const express = require('express');
const app     = express();
const server  = require('http').createServer(app);
const io      = require('socket.io')(server);

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });

    socket.on('echo', (data) => {
        socket.emit('echo', data);
    });
});

server.listen(3000, function(){
    console.log('listening on *:3000');
});
