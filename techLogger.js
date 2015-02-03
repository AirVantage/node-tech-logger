/**
 * Our Logger that wrap Winston logging library.
 * It also synchronizes the various workers in multi cluster environnement.
 *
 * Only the master cluster is allowed to call Winston.
 */
var _ = require("lodash");
var cluster = require("cluster");
var winston = require("winston");
var splash = require("./lib/splash");

var consologger;
var filogger;
var syslogger;
var syslogOptions;

module.exports = {

    /**
     * Setup winston
     *
     */
    setup: function(configuration) {

        // Logger configuration
        // Winston levels correctly ordered
        // DO NOT TRUST Winston level definition as it does not comply
        // to a "logical" threshold mechanism
        var levelsConfig = {
            levels: {
                emerg: 7,
                alert: 6,
                crit: 5,
                error: 4,
                warning: 3,
                notice: 2,
                info: 1,
                debug: 0
            },
            colors: {
                emerg: "magenta",
                alert: "magenta",
                crit: "red",
                error: "red",
                warning: "yellow",
                notice: "green",
                info: "blue",
                debug: "cyan"
            }
        };

        consologger = new(winston.Logger)({
            transports: [
                new winston.transports.Console({
                    colorize: true,
                    level: "debug"
                })
            ]
        });
        consologger.setLevels(levelsConfig.levels);

        if (configuration.logging.file) {
            filogger = new(winston.Logger)({
                transports: [
                    new winston.transports.File({
                        filename: configuration.logging.file.name,
                        maxsize: configuration.logging.file.maxSize,
                        maxFiles: configuration.logging.file.maxNumber,
                        json: configuration.logging.file.json,
                        level: "info"
                    })
                ]
            });
            filogger.setLevels(levelsConfig.levels);
        }

        if (configuration.logging.syslog) {
            syslogOptions = configuration.logging.syslog;
            require("winston-syslog");
            // syslog options
            var options = {
                host: configuration.logging.syslog.host,
                port: 514,
                protocol: "udp4",
                app_name: configuration.logging.syslog.appName,
                facility: "local0",
                level: configuration.logging.syslog.thresholdLevel
            };


            syslogger = new(winston.Logger)({
                colors: winston.config.syslog.colors,
                transports: [
                    new winston.transports.Syslog(options)
                ]
            });
            syslogger.setLevels(levelsConfig.levels);
        }

        winston.addColors(levelsConfig.colors);
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

    notice: function() {
        logOrForward("notice", Array.prototype.slice.call(arguments));
    },

    warn: function() {
        logOrForward("warning", Array.prototype.slice.call(arguments));
    },

    error: function() {
        logOrForward("error", Array.prototype.slice.call(arguments));
    },

    crit: function() {
        logOrForward("crit", Array.prototype.slice.call(arguments));
    },

    alert: function() {
        logOrForward("alert", Array.prototype.slice.call(arguments));
    },

    emerg: function() {
        logOrForward("emerg", Array.prototype.slice.call(arguments));
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

    if (consologger) {
        consologger.log(log.level, log.message);
    }

    if (filogger) {
        filogger.log(log.level, log.message);
    }

    if (syslogger) {
        syslogger.log(log.level, syslogOptions.appName, log.message);
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
function logOrForward(level, log) {

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
