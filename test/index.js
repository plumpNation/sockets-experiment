'use strict';

require('./test-helper');

describe('echo', function () {
    let server;
    let client;

    beforeEach(function (done) {
        // start the server
        server = require('../src').server;
        client = io.connect('http://localhost:3000', clientOptions);

        client.once('connect', () => {
            console.log('client connected');
            done();
        });
    });

    afterEach(function () {
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
