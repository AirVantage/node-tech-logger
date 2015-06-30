var _ = require("lodash");

var level = 0;
var _logger;

var KEYS_TO_HIDE = ["pass", "secret"];

// Just display "useful" information about the configuration
module.exports = function(logger, app, configuration) {
    _logger = logger;
    var splash = app.get("name") + " configuration -------------\n";
    splash += logObject(configuration);
    splash += " ------------------------------------------------\n";
    _logger.notice(splash);
};

function logObject(configuration) {
    var result = "";
    level++;

    _.each(configuration, function(value, key) {
        if (_.isObject(value)) {
            if (level === 1) {
                result += blankLine();
            }
            result += logKey(key);
            result += logObject(value);
        } else {
            if (level === 1) {
                result += blankLine();
            }
            result += logValue(key, value);
        }
    });
    level--;
    return result;
}

function logKey(key) {
    return "| " + indent() + " " + key + "\n";
}

function logValue(key, value) {
    var hideValue = _.reduce(KEYS_TO_HIDE, function(memo, keyToHide) {
        return memo || key.indexOf(keyToHide) >= 0;
    }, false);

    var valueToShow = hideValue ? "****" : value;

    return "| " + indent() + " " + key + ": " + valueToShow + "\n";
}

function blankLine() {
    return "|\n";
}

function indent() {
    var nbspaces = level * 2;
    return Array(nbspaces + 1).join("-");
}
