const io = require('socket.io-client');

const clientOptions = {
    'transports': ['websocket'],
    'force new connection': true
};

const client = io.connect('http://localhost:3000', clientOptions);

client.once('connect', (response) => {
    console.log('client: connection');
});
