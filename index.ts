import * as bunyan from 'bunyan';

let rootLogger = bunyan.createLogger({
    name: process.env.APP_NAME || "app",
    src: !(process.env.BUNYAN_NO_SRC),
    serializers: { err: bunyan.stdSerializers.err }
});

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