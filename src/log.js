'use strict';

module.exports = class Log {
    constructor(options) {
        const levels = {
            'log'  : 1,
            'info' : 2,
            'warn' : 3,
            'error': 4
        };

        let level = options.level;

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
        console.log.apply(null, arguments);
    }

    info() {
        const data = {
            icon      : '\u2139',

            background: "\x1b[44m", // blue
            foreground: "\x1b[36m", // blue
            text      : "\x1b[37m", // white

            reset     : "\x1b[0m",
            reverse   : "\x1b[7m"
        };

        this.out('info', data, arguments);
    }

    warn() {
        const data = {
            icon      : '\u26A0',

            background: "\x1b[43m", // yellow
            foreground: "\x1b[33m", // yellow
            text      : "\x1b[37m", // white

            reset     : "\x1b[0m",
            reverse   : "\x1b[7m"
        };

        this.out('warn', data, arguments);
    }

    error() {
        const data = {
            icon      : '✘',

            background: "\x1b[41m", // red
            foreground: "\x1b[31m", // red
            text      : "\x1b[37m", // white

            reset     : "\x1b[0m",
            reverse   : "\x1b[7m"
        };

        this.out('error', data, arguments);
    }

    out(method, data, args) {
        const params = [
            data.background + data.text,
            data.icon,
            data.reset,
            data.foreground
        ]
        .concat(this.prefix)
        .concat([].slice.call(args))
        .concat(data.reset);

        console[method].apply(null, params);
    }
};

function noop() {}
