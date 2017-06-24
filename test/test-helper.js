'use strict';

global.expect = require('chai').expect;
global.io = require('socket.io-client');

global.clientOptions = {
    'transports': ['websocket'],
    'force new connection': true
};
