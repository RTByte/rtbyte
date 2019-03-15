const RTByteClient = require('./lib/structures/RTByteClient');
const { config, token } = require('./config');

new RTByteClient(config).login(token);
