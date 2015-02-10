/**
 * Our Logger that wrap Winston logging library.
 */
var winston = require("winston");
var splash = require("./lib/splash");
var _ = require("lodash");

var configurationDate;
var consologger;
var filogger;
var syslogger;
var syslogOptions;

// Winston levels correctly ordered
// DO NOT TRUST Winston level definition as it does not comply to a "logical" threshold mechanism
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
// Make winston aware of these colors
winston.addColors(levelsConfig.colors);

module.exports = {

    /**
     * Setup the logger configuration
     * @param  {Object} config                           See below for details
     * @param  {Object} config.console                   Console configuration (optional)
     * @param  {Object} config.console.thresholdLevel    Minimum level of messages that the logger should log. Default is info.
     * @param  {Object} config.syslog                    Syslog configuration (optional)
     * @param  {Object} config.syslog.host               The host running syslogd.
     * @param  {Object} config.syslog.appName            The name of the application.
     * @param  {Object} config.syslog.thresholdLevel     Minimum level of messages that the logger should log. Default is info.
     * @param  {Object} config.file                      File configuration (optional)
     * @param  {Object} config.file.name                 The filename of the logfile to write.
     * @param  {Object} config.file.maxSize              Max size in bytes of the logfile, if the size is exceeded then a new file is created.
     * @param  {Object} config.file.maxNumber            Limit the number of files created when the size of the logfile is exceeded.
     * @param  {Object} config.file.json                 If true, messages will be logged as JSON. Default is false.
     * @param  {Object} config.file.thresholdLevel       Minimum level of messages that the logger should log. Default is info.
     *
     * @return {boolean} True if the configuration has changed, otherwise false.
     */
    setup: function(config) {
        var currentCfg = _getLoggerConfig();
        var updated = !currentCfg || !_.isEqual(currentCfg.config, config);
        if (updated) {
            _setLoggerConfig(config);
        }
        return updated;
    },

    debug: function() {
        _log("debug", Array.prototype.slice.call(arguments));
    },

    info: function() {
        _log("info", Array.prototype.slice.call(arguments));
    },

    notice: function() {
        _log("notice", Array.prototype.slice.call(arguments));
    },

    warn: function() {
        _log("warning", Array.prototype.slice.call(arguments));
    },

    error: function() {
        _log("error", Array.prototype.slice.call(arguments));
    },

    crit: function() {
        _log("crit", Array.prototype.slice.call(arguments));
    },

    alert: function() {
        _log("alert", Array.prototype.slice.call(arguments));
    },

    emerg: function() {
        _log("emerg", Array.prototype.slice.call(arguments));
    },

    createExpressLoggerStream: function(level) {
        return {
            write: function(message /*, encoding */ ) {
                _log(level, message);
            }
        };
    },

    splash: function(app, configuration) {
        splash(this, app, configuration);
    }
};

/**
 * Log the message using winston or console
 *
 * @param  {Object} log
 *             {String] log.level
 *             {String} log.message
 */
function _doLog(log) {

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
 * Log a message with the specified level
 *
 * @param  {String} level  the level
 * @param  {Array}  log    list of message parts
 */
function _log(level, log) {

    var message = log.map(function(element) {
        if (typeof element !== "string") {
            return JSON.stringify(element);
        } else {
            return element;
        }
    }).join(" ");

    if (!configurationDate || configurationDate < _getLoggerConfig().date) {
        // Logger needs to be configured
        _configureLogger();
    }

    _doLog({
        level: level,
        message: message
    });
}

/**
 * Returns the configuration of the logger
 *
 * @return {Object} the configuration of the logger
 */
function _getLoggerConfig() {
    return global.NODE_TECH_LOGGER_CFG;
}

/**
 * Set the configuration of the logger
 *
 * @param  {Object} config the logger configuration
 */
function _setLoggerConfig(config) {
    global.NODE_TECH_LOGGER_CFG = {
        date: new Date().getTime(),
        config: config
    };
}

/**
 * Initialize winston logger
 */
function _configureLogger() {
    var loggerConfig = _getLoggerConfig();
    if (!loggerConfig) {
        // Default config
        _setLoggerConfig({});
        loggerConfig = _getLoggerConfig();

        var msg = "\n\n!!! =========================================== !!!";
        msg += "\n!!!  No configuration set for node-tech-logger  !!!";
        msg += "\n!!! =========================================== !!!\n\n";
        console.warn(msg);
    }
    console.info("Logger has been configured");

    // Keep the date of the last applied configuration
    configurationDate = loggerConfig.date;

    var config = loggerConfig.config;
    _configureConsoleLogger(config);
    _configureFileLogger(config);
    _configureSyslogLogger(config);
}

/**
 * Configure console logger
 */
function _configureConsoleLogger(config) {

    if (consologger) {
        consologger.remove(winston.transports.Console);
    } else {
        consologger = new(winston.Logger)({});
        consologger.setLevels(levelsConfig.levels);
    }
    consologger.add(winston.transports.Console, {
        colorize: true,
        level: (config.console && config.console.thresholdLevel) || "info"
    });
}

/**
 * Configure file logger
 */
function _configureFileLogger(config) {

    filogger = null;
    if (config.file) {
        filogger = new(winston.Logger)({
            transports: [
                new winston.transports.File({
                    filename: config.file.name,
                    maxsize: config.file.maxSize,
                    maxFiles: config.file.maxNumber,
                    json: config.file.json || false,
                    level: config.file.thresholdLevel || "info"
                })
            ]
        });
        filogger.setLevels(levelsConfig.levels);
    }
}

/**
 * Configure syslog logger
 */
function _configureSyslogLogger(config) {

    syslogger = null;
    if (config.syslog) {
        syslogOptions = config.syslog;
        require("winston-syslog");
        // syslog options
        var options = {
            host: config.syslog.host,
            port: 514,
            protocol: "udp4",
            app_name: config.syslog.appName,
            facility: "local0",
            level: config.syslog.thresholdLevel || "info"
        };

        syslogger = new(winston.Logger)({
            colors: winston.config.syslog.colors,
            transports: [
                new winston.transports.Syslog(options)
            ]
        });
        syslogger.setLevels(levelsConfig.levels);
    }
}
