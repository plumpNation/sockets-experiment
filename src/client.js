'use strict';

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

const serverPath = `http://localhost:${argv.serverPort}`;

console.log(`client: Trying to connect to ${serverPath}`);

const io = require('socket.io-client');
const socket = io(`${serverPath}`, clientOptions);

socket.on('connect', () => {
    console.log('client: connected to server');
    console.log('client: socket id %s', socket.id);

    console.log('client: joining room 1');
    socket.emit('join', {'roomId': 1});
});

socket.on('disconnect', () => {
    console.log('client: server went down');
});

socket.on('reconnect_attempt', () => {
    console.log('client: trying to reconnect');
});

socket.on('reconnect', attemptNumber => {
    console.log(`client: reconnected after ${attemptNumber} attempts`);
});

socket.on('reconnecting', attemptNumber => {
    console.log(`client: trying to reconnect, attempt ${attemptNumber}`);
});

socket.on('joined room', () => {
    console.log('I joined a room!');
});

socket.on('user joined', data => {
    console.log('Another user joined');
    console.log('Number of users in room is now %s', data.count);
});

socket.on('user left', data => {
    console.log('Another user left');
    console.log('Number of users in room is now %s', data.count);
});
