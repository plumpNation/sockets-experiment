'use strict';

const config  = require('config');
const redis   = require('socket.io-redis');
const http    = require('http');
const express = require('express');

const Log     = require('./log');

const log = new Log(({
    'level': config.get('log.level'),
    'prefix': 'server'
}));

const redisPort = config.get('redis.port');
const redisHost = config.get('redis.host');

// socket.io namespace
const namespace = '/';

class Server {
    constructor(port) {
        const app    = express();
        const server = http.createServer(app);
        const io     = require('socket.io')(server);

        this.io = io;

        log.log(`connecting to redis server at ${redisHost}:${redisPort}`);

        // You must have a redis server up and running.
        // `6379` is the default port that redis runs on
        io.adapter(redis({
            'key': 'foobar',
            'host': redisHost || 'localhost',
            'port': redisPort || 6379,
            'requestsTimeout': 2000
        }));

        setupEvents(io, port);

        server.listen(port, () => {
            if (typeof PhusionPassenger !== 'undefined') {
                log.log(`running in passenger on localhost:${port}`);

            } else {
                log.log(`listening on localhost:${port}`);
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

function setupEvents(io, port) {
    io.on('connection', socket => {
        log.log(`client connected on port ${port}`);

        socket.on('disconnect', reason => {
            log.log('a client disconnected');

            if (!reason) log.info('no reason given for disconnection'); return;

            log.log('disconnecting reason:', reason);
        });

        socket.on('disconnecting', reason => {
            log.log('a client is disconnecting');

            // We want to tell all rooms the socket had joined that the user is leaving.
            getClientRooms(io, socket.id)
                .then(rooms => {
                    rooms.forEach(room => {
                        emitRoomPopulationChange(io, socket, room);
                    });
                })
                .catch(err => log.error(err));

            if (!reason) log.info('no reason given for disconnection'); return;

            log.log('disconnecting reason:', reason);
        });

        // We simply pass the data back
        socket.on('echo', data => {
            socket.emit('echo', data);
        });

        socket.on('join room', data => {
            if (!data || !data.roomId) {
                log.error('no roomId was supplied');

                return;
            }

            socket.join(data.roomId);

            emitRoomPopulationChange(io, socket, data.roomId);

            socket.emit('joined room', {'roomId': data.roomId});
            log.info(`client joined room ${data.roomId}`);
        });
    });
}

function emitRoomPopulationChange(io, socket, roomId) {
    if (socket.id === roomId) {
        log.log('roomId and socket.id match, not broadcasting to personal room');

        return;
    }

    // tell the user how many other users are in the room
    getRoomClients(io, roomId)
        .then(clients => {
            const count = clients.length;

            log.log('found', count, 'clients in room', roomId);

            socket.broadcast
                .to(roomId)
                .emit('room population changed', {'count': count});
        })
        .catch(err => log.error(err));
}

function getClientRooms(io, socketId) {
    log.log('getting rooms for socketId', socketId);

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
