'use strict';

const Server = require('../src/server');
const clientIO = require('socket.io-client');

require('./test-helper');

describe('echo', function () {
    let client;

    let server1;
    let server2;
    let server3;

    beforeEach(function (done) {
        // start 3 servers
        server1 = new Server(3000);
        server2 = new Server(3001);
        server3 = new Server(3002);

        expect(server1.io).to.not.equal(server2.io);

        // we'll emit to server3
        client = clientIO.connect('http://localhost:3002', clientOptions);

        client.once('connect', () => {
            console.log('client: connection');

            // note we're testing server1
            server1.io.of('/').adapter.clients((err, clients) => {
                if (err) done(err);

                expect(clients).to.have.length(1);

                server2.io.of('/').adapter.clients((err, clients) => {
                    if (err) done(err);

                    expect(clients).to.have.length(1);
                    done();
                });
            });
        });
    });

    afterEach(function (done) {
        client.once('disconnect', function () {
            console.log('client: disconnection');

            server1.io.of('/').adapter.clients((err, clients) => {
                if (err) done(err);

                expect(clients).to.have.length(0);

                server2.io.of('/').adapter.clients((err, clients) => {
                    if (err) done(err);

                    expect(clients).to.have.length(0);
                    done();
                });
            });
        });

        client.disconnect();
    });

    it('echos message back to us', function (done) {
        client.once('echo', (message) => {
            expect(message).to.equal('Hello World');

            done();
        });

        client.emit('echo', 'Hello World');
    });
});
