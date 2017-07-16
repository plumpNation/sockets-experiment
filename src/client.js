'use strict';

const config = require('config');

const Log = require('./log');
const log = new Log({
    'level': config.get('log.level'),
    'prefix': 'client'
});

const clientOptions = {
    'transports': ['websocket'],

    'reconnection'         : true,
    'reconnectionDelay'    : 1000,
    'reconnectionDelayMax' : 5000,
    'reconnectionAttempts' : 5
};

const argv = require('yargs')
    .usage('Usage: $0 [args]')
    .option('sp', {
        'alias': 'server-port',
        'default': 3000,
        'describe': 'The socket server port to connect to'
    })
    .help()
    .argv;

const serverProtocol = config.get('server.protocol') || 'http';
const serverHost     = config.get('server.host') || 'localhost';
const serverPort     = argv.serverPort || config.get('server.port');

const serverPath     = `${serverProtocol}://${serverHost}:${serverPort}`;

log.info(`trying to connect to ${serverPath}`);

const io = require('socket.io-client');
const socket = io(`${serverPath}`, clientOptions);

socket.on('connect', () => {
    log.info('connected to server');
    log.info('socket id', socket.id);
    log.info('attempting to join room <room name here>');

    socket.emit('join room', {'roomId': '<room name here>'});
});

socket.on('disconnect', () => {
    log.info('server not available');
});

socket.on('reconnect_attempt', () => {
    log.info('trying to reconnect');
});

socket.on('reconnect', attemptNumber => {
    log.info(`reconnected after ${attemptNumber} attempts`);
});

socket.on('reconnecting', attemptNumber => {
    log.info(`trying to reconnect, attempt ${attemptNumber}`);
});

socket.on('joined room', data => {
    log.log('i joined room', data.roomId);
});

socket.on('room population changed', data => {
    log.log('room population changed');
    log.log('number of users in room is now', data.count);
});
