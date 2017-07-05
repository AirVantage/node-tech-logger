const configuration = require('config');
const logger = require('../techLogger');

const app = {
    get: () => 'Test Splash'
};

logger.setup(configuration.logging);
logger.splash(app, configuration);
