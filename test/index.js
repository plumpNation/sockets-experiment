'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const io = require('socket.io-client');

const options = {
    'transports': ['websocket'],
    'force new connection': true
};

describe('echo', function () {
    let server;
    let client;

    beforeEach(function (done) {
        // start the server
        server = require('../src').server;
        client = io.connect('http://localhost:3000', options);

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
