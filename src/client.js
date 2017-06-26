'use strict';

const clientOptions = {
    'transports': ['websocket'],
    'force new connection': true
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

    socket.emit('join', {'roomId': 1});
});

socket.on('joined room', () => {
    console.log('I joined a room!');
});

socket.on('user joined', (data) => {
    console.log('Another user joined');
    console.log('Number of users in room is now %s', data.count);
});

socket.on('user left', (data) => {
    console.log('Another user left');
    console.log('Number of users in room is now %s', data.count);
});

socket.on('disconnect', () => {
    console.log('client: disconnected from server');
});
