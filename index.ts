import * as bunyan from 'bunyan';


let rootLogger = bunyan.createLogger({
    name: process.env.APP_NAME || "app",
    src: !(process.env.BUNYAN_NO_SRC),
    serializers: {
        err: err => Object.assign({
            message: err.message,
            name: err.name,
            stack: getFullErrorStack(err),
            code: err.code,
            signal: err.signal
        }, err)
    }
});

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