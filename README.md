node-tech-logger
================

> Wraps Winston logger to provide a high level API.
>
> It also synchronizes the various workers in multi cluster environnement. Only the master cluster is allowed to call Winston.

## Usage

```javascript
	var logger = require("node-tech-logger");
    ...
    // Setup the logger providing a configuration JSON object like
    var configuration = {
        logging: {
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
            }
        }
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
```

## TODO

 * Add API documentation
 * Add multi cluster environnement example.




