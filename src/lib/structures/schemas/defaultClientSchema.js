const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultClientSchema
	.add('guilds', folder => folder.add('controlGuild', 'guild'))
	.add('channels', folder => folder.add('globalLog', 'textchannel'))
	.add('logs', folder => folder
		.add('botReady', 'boolean', { default: true })
		.add('commandRun', 'boolean', { default: true })
		.add('guildCreate', 'boolean', { default: true })
		.add('guildDelete', 'boolean', { default: true })
		.add('guildUpdate', 'boolean', { default: true })
		.add('guildUnavailable', 'boolean', { default: true }))
	.add('moderation', folder => folder
		.add('cases', 'any', { array: true }))
	.add('twitchOauthBearer', 'string');
