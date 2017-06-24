'use strict';

global.expect = require('chai').expect;
global.clientIO = require('socket.io-client');

global.clientOptions = {
    'transports': ['websocket'],
    'force new connection': true
};
