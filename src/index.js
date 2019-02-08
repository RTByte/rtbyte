const { Client } = require('klasa');
const { config, token } = require('./config');

class Bot extends Client {}

new Bot(config).login(token);