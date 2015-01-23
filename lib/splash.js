var _ = require("underscore");

var level = 0;
var _logger;

// Just display "useful" information about the configuration
module.exports = function(logger, app, configuration) {
    _logger = logger;
    _logger.info("------------------------------------------------");
    _logger.info("|");
    _logger.info("|       '" + app.get("name") + "'", "configuration");
    _logger.info("|");
    _logger.info("|            ~~~~~~~~~~~~~~~~~~~~");
    logObject(configuration);
    _logger.info("------------------------------------------------");

};

function logObject(configuration) {
    level++;

    _.each(configuration, function(value, key) {
        if (_.isObject(value)) {
            if (level === 1) {
                separator();
            }
            _logger.info("|", indent(), key);
            logObject(value);
        } else {
            if (level === 1) {
                blankLine();
            }
            logValue(key, value);
        }
    });
    level--;
}

function logValue(key, value) {
    _logger.info("|", indent(), key + ":", value);
}

function separator() {
    _logger.info("| -----------");
}

function blankLine() {
    _logger.info("|");
}

function indent() {
    var nbspaces = level * 2;
    return Array(nbspaces + 1).join(" ");
}
