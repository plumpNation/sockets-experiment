'use strict';

const express = require('express');
const redis   = require('socket.io-redis');
const config  = require('config');

// socket.io namespace
const namespace = '/';

class Server {
    constructor(port) {
        const app    = express();
        const server = require('http').createServer(app);
        const io     = require('socket.io')(server);

        const redisPort = config.get('redis.port');
        const redisHost = config.get('redis.host');

        this.io = io;

        console.log(`Connecting to redis server at ${redisHost}:${redisPort}`);

        // You must have a redis server up and running.
        // `6379` is the default port that redis runs on
        io.adapter(redis({
            'key': 'foobar',
            'host': redisHost || 'localhost',
            'port': redisPort || 6379,
            'requestsTimeout': 2000
        }));

        setupEvents(io);

        console.log(`server: trying to bind server to *:${port}`);

        server.listen(port, function () {
            console.log(`server: listening on *:${port}`);
        });
    }
}

// Can also run from the command line with the `serve [port]` command
require('yargs')
    .usage('$0 <cmd> [args]')
    .command('serve [port]', 'start the server', (yargs) => {
        return yargs.option('port', {
            describe: 'Port that the socket server instance should bind on',
            default: 3000
        })
    }, (argv) => {
        new Server(argv.port);
    })
    .help()
    .argv

module.exports = Server;

function setupEvents(io) {
    io.on('connection', function (socket) {
        console.log(`server: client connected ${socket.id}`);

        socket.on('disconnect', (data) => {
            console.log('server: client disconnected');

            socket.broadcast.to(data.roomId).emit('user left', {
                'count': getSocketIdsInRoom(io, namespace, data.roomId)
            });
        });

        // We simply pass the data back
        socket.on('echo', (data) => {
            socket.emit('echo', data);
        });

        socket.on('join', (data) => {
            console.log(`Joining room ${data.roomId}`);

            socket.join(data.roomId);

            socket.broadcast.to(data.roomId).emit('user joined', {
                'count': getSocketIdsInRoom(io, namespace, data.roomId)
            });

            socket.emit('joined room');
        });
    });
}

function getSocketIdsInRoom(io, namespace, roomId) {
    const room = io.nsps[namespace].adapter.rooms[roomId];
    const numberUsersInRoom = room && room.sockets ? Object.keys(room.sockets).length : 0;

    return numberUsersInRoom;
}
