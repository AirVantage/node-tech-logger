const configuration = require('config');

const logger1 = require('../techLogger')('logger1');
const logger2 = require('../techLogger')();
const logger3 = require('../techLogger'); // Look ma, same conf as earlier

logger1.setup(configuration.logging);
logger2.setup(configuration.logging);
logger3.setup(configuration.logging);

logger1.debug('This is a debug log');
logger2.debug('This is a debug log');

logger1.info('This is an info log');
logger2.info('This is an info log');
logger3.info('This is an info log');

logger1.notice('This is a notice log');
logger2.notice('This is a notice log');
logger3.notice('This is a notice log');

logger1.warn('This is a warn log');
logger2.warn('This is a warn log');
logger3.warn('This is a warn log');

logger1.error('This is an error log');
logger2.error('This is an error log');
logger3.error('This is an error log');

const apiError = {
  message: 'API error message'
};

logger1.error('This is an error log', new Error(apiError.message));
logger2.error('This is an error log', new Error(apiError.message));
logger3.error('This is an error log', new Error(apiError.message));

logger1.crit('This is a critical log');
logger2.crit('This is a critical log');
logger3.crit('This is a critical log');

logger1.alert('This is an alert log');
logger2.alert('This is an alert log');
logger3.alert('This is an alert log');

logger1.emerg('This is an emergency log');
logger2.emerg('This is an emergency log');
logger3.emerg('This is an emergency log');

//  Circular references support
const circularObj = {};
circularObj.circularRef = circularObj;
circularObj.list = [circularObj, circularObj];

logger1.info("The following object contains a circular ref and nothing's blowing up \\o/  \n", circularObj);
logger2.info("The following object contains a circular ref and nothing's blowing up \\o/ \n", circularObj);
logger3.info("The following object contains a circular ref and nothing's blowing up \\o/ \n", circularObj);

// Object of xxxStream type
class TestStream {}
var testStream = new TestStream();

logger1.info('The following object is a TestStream and I will not log it \\o/  \n', testStream);
logger2.info('The following object is a TestStream and I will not log it \\o/  \n', testStream);
logger3.info('The following object is a TestStream and I will not log it \\o/  \n', testStream);
