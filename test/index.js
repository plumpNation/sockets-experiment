'use strict';

const Server = require('../src/server');
const clientIO = require('socket.io-client');

const server0Path = 'http://localhost:3000';
const server1Path = 'http://localhost:3001';
const server2Path = 'http://localhost:3002';

require('./test-helper');

let server0;
let server1;
let server2;

let client0;
let client1;

describe('server', function () {
    describe('socketMessage: "echo"', () => {
        beforeEach(done => {
            // start 3 servers
            server0 = new Server(3000);
            server1 = new Server(3001);
            server2 = new Server(3002);

            expect(server0.io).to.not.equal(server1.io);

            // we'll emit to server2
            client0 = clientIO.connect(server2Path, clientOptions);

            client0.once('connect', () => {
                // note we're testing server0
                server0.io.of('/').adapter.clients((err, clients) => {
                    if (err) done(err);

                    expect(clients).to.have.length(1);

                    server1.io.of('/').adapter.clients((err, clients) => {
                        if (err) done(err);

                        expect(clients).to.have.length(1);
                        done();
                    });
                });
            });
        });

        afterEach(done => {
            client0.once('disconnect', () => onClientDisconnect(done));

            client0.disconnect();

            server0.io.close();
            server1.io.close();
            server2.io.close();
        });

        it('echos message back to us', done => {
            client0.once('echo', assertReponse);
            client0.emit('echo', 'Hello World');

            function assertReponse(message) {
                expect(message).to.equal('Hello World');

                done();
            }
        });

        function onClientDisconnect(done) {
            server0.io.of('/').adapter.clients((err, clients) => {
                if (err) done(err);

                expect(clients).to.have.length(0);

                server1.io.of('/').adapter.clients((err, clients) => {
                    if (err) done(err);

                    expect(clients).to.have.length(0);

                    done();
                });
            });
        }
    });

    describe('socketMessage: "room population changed"', () => {
        beforeEach(done => {
            server0 = new Server(3000);
            server1 = new Server(3001);

            // set up a listening client
            client0 = clientIO.connect(server1Path, clientOptions);

            client0.once('connect', () => {
                client0.emit('join room', {'roomId': 'MY_ROOM_ID'});

                client0.once('joined room', () => {
                    // wait until the client0 is connected to start setting up client1
                    client1 = clientIO.connect(server0Path, clientOptions);

                    client1.once('connect', () => {
                        client1.emit('join room', {'roomId': 'MY_ROOM_ID'});

                        // we don't want to hear this in the test, so when we
                        // get the message that the population changed, we
                        // know client1 is in the room and we are ready to test
                        client0.once('room population changed', () => done());
                    });
                });
            });
        });

        afterEach(() => {
            client0.disconnect();
            client1.disconnect();

            server0.io.close();
            server1.io.close();
        });

        it('should tell client0 new room population when client1 joins', done => {
            client0.once('room population changed', assertReponse);
            client1.emit('join room', {'roomId': 'MY_ROOM_ID'});

            function assertReponse(data) {
                expect(data.count).to.equal(2);

                done();
            }
        });

        it('should tell client0 new room population when client1 disconnects', done => {
            client0.once('room population changed', assertReponse);

            // could test leaving the room etc, but a disconnect is good enough for now
            client1.disconnect();

            function assertReponse(data) {
                expect(data.count).to.equal(1);

                done();
            }
        });
    });
});
