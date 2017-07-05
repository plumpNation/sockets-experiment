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

        server.listen(port, () => {
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
    io.on('connection', socket => {
        console.log(`server: client connected ${socket.id}`);

        socket.on('disconnect', reason => {
            console.log('server: a client disconnected');

            if (reason) return console.info('server: disconnecting reason:', reason);

            console.warn('server: no reason given');
        });

        socket.on('disconnecting', reason => {
            console.log('server: a client is disconnecting');

            // We want to tell all rooms the socket had joined that the user is leaving.
            getClientRooms(io, socket.id)
                .then(rooms => {
                    rooms.forEach(room => {
                        getRoomClients(io, room)
                            .then(clients => {
                                socket.broadcast
                                    .to(room)
                                    .emit('user left', {'count': clients.length});
                            });
                    });
                })
                .catch(err => console.error(err));

            if (reason) return console.info('server: disconnecting reason:', reason);

            console.warn('server: no reason given');
        });

        // We simply pass the data back
        socket.on('echo', data => {
            socket.emit('echo', data);
        });

        socket.on('join', data => {
            console.log(`Joining room ${data.roomId}`);

            socket.join(data.roomId);

            getRoomClients(io, data.roomId)
                .then(clients => {
                    socket.broadcast
                        .to(data.roomId)
                        .emit('user joined', {'count': clients.length});
                })
                .catch(err => console.error(err));

            socket.emit('joined room');
        });
    });
}

function getClientRooms(io, socketId) {
    console.log('server: getting rooms for socketId %s', socketId);
    return new Promise((resolve, reject) => {
        io.of('/').adapter.clientRooms(socketId, (err, rooms) => {
            if (err) return reject(err);

            resolve(rooms);
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
