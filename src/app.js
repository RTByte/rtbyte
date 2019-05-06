const { Client } = require('./index');
const { config, token } = require('./config');

new Client(config).login(token);
