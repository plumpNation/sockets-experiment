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
            console.log(`server: listening on localhost:${port}`);

            if (typeof PhusionPassenger !== 'undefined') {
                console.log(`server: running in passenger on localhost:${port}`);

            } else {
                console.log(`server: listening on localhost:${port}`);
            }
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

            getRoomClients(io, data.roomId)
                .then((clients) => {
                    socket.broadcast.to(data.roomId).emit('user left', {
                        'count': clients.length
                    });
                });
        });

        // We simply pass the data back
        socket.on('echo', (data) => {
            socket.emit('echo', data);
        });

        socket.on('join', (data) => {
            console.log(`Joining room ${data.roomId}`);

            socket.join(data.roomId);

            getRoomClients(io, data.roomId)
                .then((clients) => {
                    socket.broadcast.to(data.roomId).emit('user joined', {
                        'count': clients.length
                    });
                });

            socket.emit('joined room');
        });
    });
}

function getRoomClients(io, roomId) {
    return new Promise((resolve, reject) => {
        io.in(roomId).clients((err, clients) => {
            if (err) return reject(err);

            resolve(clients);
        });
    });
}
