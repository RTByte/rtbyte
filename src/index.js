const { Client } = require('klasa');
const { config, token } = require('./config');


Client.defaultPermissionLevels
	.add(5, (client, msg) => msg.guild && msg.member.roles.has(msg.guild.configs.roles.moderator))
	.add(6, (client, msg) => msg.guild && msg.member.roles.has(msg.guild.configs.roles.administrator));

class Bot extends Client {}

new Bot(config).login(token);
