const _ = require("lodash");

let level = 0;
let _logger;

let KEYS_TO_HIDE = ["pass", "secret"];

// Just display "useful" information about the configuration
module.exports = function(logger, app, configuration) {
    _logger = logger;
    if (configuration.logging.keysToHide) {
        KEYS_TO_HIDE = configuration.logging.keysToHide;
    }
    var splash = `${app.get("name")} configuration -------------
${logObject(configuration)}
 ------------------------------------------------`;
    _logger.notice(splash);
};

function logObject(configuration) {

    var result = "";
    level++;

    _.forEach(configuration, (value, key) => {
        if (_.isArray(value)) {
            if (level === 1) {
                result += blankLine();
            }
            result += logArray(key, value);
        } else if (_.isObject(value)) {
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

function valueToShow(key, value) {

    const isKeyASecret = (keyToHide) => {
        // Does the key match one of the hidden keys pattern
        return key.match(new RegExp(`.*${keyToHide}.*`, "i")) !== null;
    };

    return _.some(KEYS_TO_HIDE, isKeyASecret) ? "****" : value;
}

function logKey(key) {
    return `| ${indent()} ${key} \n`;
}

function logValue(key, value) {
    return `| ${indent()} ${key}: ${valueToShow(key, value)} \n`;
}

function logArray(key, value) {
    return `| ${indent()} ${key}: [${valueToShow(key, value)}] \n`;
}

function blankLine() {
    return "|\n";
}

function indent() {
    var nbspaces = level * 2;
    return Array(nbspaces + 1).join("-");
}
