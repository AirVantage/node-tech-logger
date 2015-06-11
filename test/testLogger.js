// var path = require("path");
var configuration = require("config");
var logger1 = require("../techLogger")("logger1");
var logger2 = require("../techLogger")();


logger1.setup(configuration.logging);
logger2.setup(configuration.logging);


logger1.debug("This is a debug log");
logger2.debug("This is a debug log");

logger1.info("This is an info log");
logger2.info("This is an info log");

logger1.notice("This is a notice log");
logger2.notice("This is a notice log");

logger1.warn("This is a warn log");
logger2.warn("This is a warn log");

var apiError = {
    message: "API error message"
};
logger1.error("This is an error log", new Error(apiError.message).stack);
logger2.error("This is an error log", new Error(apiError.message).stack);

logger1.crit("This is a critical log");
logger2.crit("This is a critical log");

logger1.alert("This is an alert log");
logger2.alert("This is an alert log");

logger1.emerg("This is an emergency log");
logger2.emerg("This is an emergency log");
