var configuration = require("config");
var logger = require("../techLogger");

var app = {
    get: function() {
        return "Test Splash";
    }
};

logger.setup(configuration);
logger.splash(app, configuration);
