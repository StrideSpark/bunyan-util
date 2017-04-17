import * as bunyan from 'bunyan';

const SANITIZED_KEYS = ['password', 'secret', 'credentials'];

let rootLogger = bunyan.createLogger({
    name: process.env.APP_NAME || "app",
    src: !(process.env.BUNYAN_NO_SRC),
    level: (process.env.BUNYAN_LEVEL || 'info'),
    serializers: {
        err: err => Object.assign({
            message: err.message,
            name: err.name,
            stack: getFullErrorStack(err),
            code: err.code,
            signal: err.signal
        }, sanitizeObject(err))

    }
});

export function sanitizeObject(input: { [key: string]: any }) {
    const result: { [key: string]: any } = {};
    for (const k of Object.keys(input)) {
        if (containsMatch(k)) {
            result[k] = 'SANITIZED';
        } else if (typeof input[k] !== null && typeof input[k] === 'object') {
            result[k] = sanitizeObject(input[k]);
        } else {
            result[k] = input[k];
        }
    }
    return result;
}

function containsMatch(key: string): boolean {
    return SANITIZED_KEYS.some(target => key.toLowerCase().indexOf(target) !== -1);
}

/*
 * copied from bunyan
 * This function dumps long stack traces for exceptions having a cause()
 * method. The error classes from
 * [verror](https://github.com/davepacheco/node-verror) and
 * [restify v2.0](https://github.com/mcavage/node-restify) are examples.
 *
 * Based on `dumpException` in
 * https://github.com/davepacheco/node-extsprintf/blob/master/lib/extsprintf.js
 */
export function getFullErrorStack(ex: any) {
    var ret = ex.stack || ex.toString();
    if (ex.cause && typeof (ex.cause) === 'function') {
        var cex = ex.cause();
        if (cex) {
            ret += '\nCaused by: ' + getFullErrorStack(cex);
        }
    }
    return (ret);
}


let childLog = rootLogger;

export function overrideRootLogger(logger: bunyan.Logger) {
    rootLogger = logger;
}

export function logger(): bunyan.Logger {
    return childLog;
}

export function replaceLoggerContext(context: Object) {
    childLog = rootLogger.child(context);
}

export function augmentLoggerContext(context: Object) {
    childLog = childLog.child(context);
}
