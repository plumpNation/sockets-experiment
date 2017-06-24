'use strict';

global.expect = require('chai').expect;

global.clientOptions = {
    'transports': ['websocket'],
    'force new connection': true
};
