node-tech-logger
================

> Wraps Winston logger to provide a high level API.

## Usage

```javascript
	var logger = require("node-tech-logger");
    ...
    // Setup the logger providing a configuration JSON object like
    var configuration = {
        console: {
            thresholdLevel: "info"
        }
        file: {
            name: "logs/webapp.log",
            maxSize: 5000000,
            maxNumber: 5,
            json: false,
            thresholdLevel: "info"
        },
        syslog: {
            host: "syslogdHost" // The host running syslogd, defaults to localhost.
            appName: "yourApplicationName",
            thresholdLevel: "warning"
        },
        keysToHide: ["pass", "secret"]
    };
    logger.setup(configuration);

    // You're good to go
    logger.debug("Debug level message");
    logger.info("Info level message");
    logger.warn("Warn level message");
    logger.error("Error level message");

    // Used to display your express application deployment configuration
    // Take a look at the "test" folder for an example
    logger.splash(app, configuration);

    // Update the logger configuration each time the file 'local.yml' is updated
    fs.watchFile('config/local.yml', function(curr, prev) {
        if (curr.mtime !== prev.mtime) {
            delete require.cache[require.resolve("config")];
            var cfg = require("config");
            if (logger.setup(cfg)) {
                logger.notice("Logger configuration has been updated...");
                logger.splash(app, cfg);
            }
        }
    });
```

