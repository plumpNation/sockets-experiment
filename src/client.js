
const io = require('socket.io-client');

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

console.log(argv);
console.log(`client: connecting to ${argv.serverPort}`);

const client = io.connect(`http://localhost:${argv.serverPort}`, clientOptions);

client.on('connect', (response) => {
    console.log('client: connection');
});

client.on('disconnect', (response) => {
    console.log('client: disconnecting');
});
