/**
 * Our Logger that wrap Winston logging library.
 * It also synchronizes the various workers in multi cluster environnement.
 *
 * Only the master cluster is allowed to call Winston.
 */
var _ = require("underscore");
var cluster = require("cluster");
var winston = require("winston");
var splash = require("./lib/splash");

module.exports = {

    /**
     * Setup winston
     *
     */
    setup: function(configuration) {

        // Logger configuration
        winston.remove(winston.transports.Console);
        winston.add(winston.transports.Console, {
            colorize: true,
            level: "debug"
        });
        if (configuration.logging.file) {
            winston.add(winston.transports.File, {
                filename: configuration.logging.file.name,
                maxsize: configuration.logging.file.maxSize,
                maxFiles: configuration.logging.file.maxNumber,
                json: configuration.logging.file.json,
            });
        }
    },

    /**
     * Register a new worker by listening to its messages of type "log"
     *
     * @param  {Worker} worker
     *         The worker to listen
     */
    register: function(worker) {
        worker.process.on("message", function(message) {
            if (_.isObject(message) && message.type === "log") {
                doLog(message);
            }
        });
    },

    debug: function() {
        logOrForward("debug", Array.prototype.slice.call(arguments));
    },

    info: function() {
        logOrForward("info", Array.prototype.slice.call(arguments));
    },

    warn: function() {
        logOrForward("warn", Array.prototype.slice.call(arguments));
    },

    error: function() {
        logOrForward("error", Array.prototype.slice.call(arguments));
    },

    createExpressLoggerStream: function(level) {
        return {
            write: function(message /*, encoding */ ) {
                logOrForward(level, message);
            }
        };
    },
    splash: function(app, configuration) {
        splash(this, app, configuration);
    }
};


/**
 * Log the message using winston
 *
 * @param  {Object} log
 *             {String] log.level
 *             {String} log.message
 */
function doLog(log) {
    switch (log.level) {
        case "debug":
            winston.debug(log.message);
            break;
        case "warn":
            winston.warn(log.message);
            break;
        case "error":
            winston.error(log.message);
            break;

        default:
            winston.info(log.message);
            break;
    }
}

/**
 * Only the master process is allowed to log to avoid issues on the
 * file rolling mechanism.
 *
 * Logging requests comming from the master are
 * directly logged through winston.
 * Those comming from a worker are forwarded to the master
 *
 * @param  {[type]} level [description]
 * @param  {Array} log   [list of message parts]
 * @return {[type]}       [description]
 */
function logOrForward(level, log)  {

    var message = log.map(function(element) {
        if (typeof element !== "string") {
            return JSON.stringify(element);
        } else {
            return element;
        }
    }).join(" ");

    // We're in master we can directly log
    if (cluster.isMaster) {
        doLog({
            level: level,
            message: message
        });
        return;
    }

    // Otherwise send a message to the master to let it log
    process.send({
        type: "log",
        level: level,
        message: message
    });
}
