'use strict';

/**
 * Module based on the console-warn, console-log, console-error modules.
 * https://github.com/abdennour/node-console-error
 * https://github.com/abdennour/node-console-warn
 * https://github.com/abdennour/node-console-info
 */
module.exports = class Log {
    constructor(options) {
        const levels = {
            'log'  : 1,
            'info' : 2,
            'warn' : 3,
            'error': 4
        };

        const level = levels[options && options.level];

        if (!level) {
            throw new TypeError('`options.level` must be log, info, warn or error');
        }

        // an empty array will concat without adding a new item in the console args
        this.prefix = options.prefix + ':' || [];

        switch (true) {
            case level === 2:
                this.log = noop;
                break;

            case level === 3:
                this.log = noop;
                this.info = noop;
                break;

            case level === 4:
                this.log = noop;
                this.info = noop;
                this.warn = noop;
                break;
        }
    }

    log() {
        console.log.apply(null, [this.prefix].concat([].slice.call(arguments)));
    }

    info() {
        const data = {
            icon      : '\u2139',
            background: '\x1b[44m',
            foreground: '\x1b[36m'
        };

        this.out('info', data, arguments);
    }

    warn() {
        const data = {
            icon      : '\u26A0',
            background: '\x1b[43m',
            foreground: '\x1b[33m'
        };

        this.out('warn', data, arguments);
    }

    error() {
        const data = {
            icon      : '✘',
            background: '\x1b[41m',
            foreground: '\x1b[31m'
        };

        this.out('error', data, arguments);
    }

    out(method, data, args) {
        const text  = '\x1b[37m';
        const reset = '\x1b[0m';

        const params = [
            data.background + text,
            data.icon,
            reset,
            data.foreground
        ]
        .concat(this.prefix)
        .concat([].slice.call(args))
        .concat(reset);

        console[method].apply(null, params);
    }
};

function noop() {}
