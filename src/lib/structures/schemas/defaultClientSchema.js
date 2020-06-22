const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultClientSchema
	.add('guilds', folder => folder.add('controlGuild', 'guild'))
	.add('channels', folder => folder.add('globalLog', 'textchannel'))
	.add('emoji', folder => folder
		.add('affirm', 'string')
		.add('reject', 'string')
		.add('arrowLeft', 'string')
		.add('arrowToLeft', 'string')
		.add('arrowRight', 'string')
		.add('arrowToRight', 'string')
		.add('info', 'string')
		.add('list', 'string')
		.add('online', 'string')
		.add('idle', 'string')
		.add('dnd', 'string')
		.add('offline', 'string')
		.add('botBadge', 'string'))
	.add('logs', folder => folder
		.add('botReady', 'boolean', { default: true })
		.add('commandRun', 'boolean', { default: true })
		.add('guildCreate', 'boolean', { default: true })
		.add('guildDelete', 'boolean', { default: true })
		.add('guildUpdate', 'boolean', { default: true })
		.add('guildUnavailable', 'boolean', { default: true }))
	.add('colors', folder => folder
	// Informative, neutral
		.add('white', 'string', { default: '#FEFEFE' })
	// Users leaving, actions against users, severe warnings, errors
		.add('red', 'string', { default: '#FF4B4B' })
	// Users joining, stuff being added
		.add('green', 'string', { default: '#4BFF4B' })
	// Punishments being taken away, warnings, bot restarts
		.add('yellow', 'string', { default: '#FFFF4B' })
	// Message deletions and updates, changes
		.add('blue', 'string', { default: '#4B4BFF' })
	// Nitro Boosts
		.add('pink', 'string', { default: '#F47FFF' })
	// Starboard
		.add('gold', 'string', { default: '#DAA520' })
	// Twitch
		.add('purple', 'string', { default: '#9046FF' }))
	.add('moderation', folder => folder
		.add('cases', 'any', { array: true }))
	.add('twitchOauthBearer', 'string');
