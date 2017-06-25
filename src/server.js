'use strict';

class Server {
    constructor(port) {
        const express = require('express');
        const app     = express();
        const server  = require('http').createServer(app);
        const redis   = require('socket.io-redis');
        const io      = require('socket.io')(server);
        this.io = io;

        // You must have a redis server up and running.
        // `6379` is the default port that redis runs on
        io.adapter(redis({
            'key': 'foobar',
            'host': 'localhost',
            'port': 6379,
            'requestsTimeout': 2000
        }));

        io.on('connection', function (connection) {
            console.log(`server: connection ${connection.id}`);

            connection.on('disconnect', (data) => {
                console.log('server: disconnection');
            });

            // We simply pass the data back
            connection.on('echo', (data) => {
                connection.emit('echo', data);
            });
        });

        console.log(`trying to bind server to *:${port}`);

        server.listen(port, function () {
            console.log(`listening on *:${port}`);
        });
    }
}

// Can also run from the command line with the `serve [port]` command
require('yargs')
    .usage('$0 <cmd> [args]')
    .command('serve [port]', 'start the server', (yargs) => {
        return yargs.option('port', {
            describe: 'Port server should bind on',
            default: 3000
        })
    }, (argv) => {
        console.log(argv);
        new Server(argv.port);
    })
    .help()
    .argv

module.exports = Server;
