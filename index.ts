import * as bunyan from 'bunyan';

const SANITIZED_KEYS = new Set(['password', 'secret', 'credentials']);

let rootLogger = bunyan.createLogger({
    name: process.env.APP_NAME || "app",
    src: !(process.env.BUNYAN_NO_SRC),
    level: (process.env.BUNYAN_LEVEL || 'info'),
    serializers: {
        err: err => {
            const sanitizedErr = { ...err };
            sanitizeObject(err);
            return Object.assign({
                message: sanitizedErr.message,
                name: sanitizedErr["name"],
                stack: getFullErrorStack(sanitizedErr),
                code: sanitizedErr["code"],
                signal: sanitizedErr["signal"]
            }, sanitizedErr)
        }
    }
});

function sanitizeObject(input: { [key: string]: any }) {
    for (const k of Object.keys(input)) {
        if (SANITIZED_KEYS.has(k)) {
            input[k] = 'SANITIZED';
        } else if (typeof input[k] !== null && typeof input[k] === 'object') {
            sanitizeObject(input[k]);
        }
    }
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
