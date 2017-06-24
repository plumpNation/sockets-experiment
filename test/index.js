'use strict';

require('./test-helper');

describe('echo', function () {
    let client;
    let serverIO;

    beforeEach(function (done) {
        // start the server
        ({serverIO} = require('../src'));

        client = clientIO.connect('http://localhost:3000', clientOptions);

        client.once('connect', () => {
            console.log('client: connection');

            serverIO.of('/').adapter.clients((err, clients) => {
                if (err) done(err);

                expect(clients).to.have.length(1);
                done();
            });
        });
    });

    afterEach(function (done) {
        client.once('disconnect', function () {
            console.log('client: disconnection');

            serverIO.of('/').adapter.clients((err, clients) => {
                if (err) done(err);

                expect(clients).to.have.length(0);
                done();
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
