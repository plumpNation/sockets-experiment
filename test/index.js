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

        done();
    });

    it('echos message back to us', function (done) {
        client.once('connect', function () {
            console.log('client connected');

            client.once('echo', function (message) {
                expect(message).to.equal('Hello World');

                console.log('disconnecting');
                client.disconnect();

                done();
            });

            console.log('Sending test message', '"Hello World"');
            client.emit('echo', 'Hello World');
        });
    });
});
