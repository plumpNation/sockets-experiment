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
    beforeEach(function (done) {
        // start 3 servers
        server0 = new Server(3000);
        server1 = new Server(3001);
        server2 = new Server(3002);

        expect(server0.io).to.not.equal(server1.io);

        // we'll emit to server2
        client0 = clientIO.connect(server2Path, clientOptions);

        client0.once('connect', () => {
            console.log('client: connection');

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

    afterEach(function (done) {
        client0.once('disconnect', () => onClientDisconnect(done));

        client0.disconnect();

        server0.io.close();
        server1.io.close();
        server2.io.close();
    });

    describe('echo()', () => {
        it('echos message back to us', done => {
            client0.once('echo', assertReponse);
            client0.emit('echo', 'Hello World');

            function assertReponse(message) {
                expect(message).to.equal('Hello World');

                done();
            }
        });
    });

    // describe('socketMessage: user joined', () => {
    //     it('should tell client0 how many users are in the room', done => {
    //         client0.once('user joined', assertReponse);
    //         clientIO.connect(server0Path, clientOptions);
    //
    //         function assertReponse(data) {
    //             expect(data.count).to.equal(2);
    //
    //             done();
    //         }
    //     });
    // });
});

////////////////////////////////////////////////////////////////////////////////////////////////////

function onClientDisconnect(done) {
    console.log('client: disconnection');

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
