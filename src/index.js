const { Client } = require('klasa');
const { config, token } = require('./config');

// Defining global variables
Client.defaultClientSchema
	.add('botOwners', 'string', { array: true })
	.add('guilds', folder => folder
		.add('controlGuild', 'guild'))
	.add('channels', folder => folder
		.add('globalLog', 'textchannel'))
	.add('emoji', folder => folder
		.add('affirm', 'string')
		.add('reject', 'string')
		.add('arrowLeft', 'string')
		.add('arrowRight', 'string')
		.add('online', 'string')
		.add('idle', 'string')
		.add('dnd', 'string')
		.add('offline', 'string'))
	.add('logs', folder => folder
		.add('botReady', 'boolean', { default: true })
		.add('commandRun', 'boolean', { default: true })
		.add('guildCreate', 'boolean', { default: true })
		.add('guildDelete', 'boolean', { default: true })
		.add('guildUpdate', 'boolean', { default: true })
		.add('guildUnavailable', 'boolean', { default: true }))
	.add('colors', folder => folder
		// Informative, neutral
		.add('white', 'string', { default: '#FFFFFF' })
		// Users leaving, actions against users, severe warnings, errors
		.add('red', 'string', { default: '#FF4B4B' })
		// Users joining, stuff being added
		.add('green', 'string', { default: '#4BFF4B' })
		// Punishments being taken away, warnings, bot restarts
		.add('yellow', 'string', { default: '#FFFF4B' })
		// Message deletions and updates, user updates
		.add('blue', 'string', { default: '#4B4BFF' }));

// Defining default guild variables.
Client.defaultGuildSchema
	.add('channels', folder => folder
		.add('log', 'textchannel'))
	.add('roles', folder => folder
		.add('administrator', 'role')
		.add('moderator', 'role')
		.add('muted', 'role'))
	.add('logs', folder => folder
		.add('verboseLogging', 'boolean', { default: false })
		.add('events', folder => folder // eslint-disable-line
			.add('channelCreate', 'boolean', { default: false })
			.add('channelDelete', 'boolean', { default: false })
			.add('channelUpdate', 'boolean', { default: false })
			.add('emojiCreate', 'boolean', { default: false })
			.add('emojiDelete', 'boolean', { default: false })
			.add('emojiUpdate', 'boolean', { default: false })
			.add('guildUpdate', 'boolean', { default: false })
			.add('guildBanAdd', 'boolean', { default: false })
			.add('guildBanRemove', 'boolean', { default: false })
			.add('guildSoftBanAdd', 'boolean', { default: false })
			.add('guildMemberAdd', 'boolean', { default: false })
			.add('guildMemberRemove', 'boolean', { default: false })
			.add('guildMemberUpdate', 'boolean', { default: false })
			.add('guildMemberKick', 'boolean', { default: false })
			.add('guildMemberMute', 'boolean', { default: false })
			.add('guildMemberUnmute', 'boolean', { default: false })
			.add('guildMemberWarn', 'boolean', { default: false })
			.add('messageDelete', 'boolean', { default: false })
			.add('messageUpdate', 'boolean', { default: false })
			.add('roleCreate', 'boolean', { default: false })
			.add('roleDelete', 'boolean', { default: false })
			.add('roleUpdate', 'boolean', { default: false })
			.add('messagePurge', 'boolean', { default: false })
			.add('blacklistedWord', 'boolean', { default: false })
			.add('blacklistedNickname', 'boolean', { default: false })
			.add('antiInvite', 'boolean', { default: false })))
	.add('greetings', folder => folder
		.add('welcomeNewUsers', 'boolean', { default: false })
		.add('welcomeChannel', 'textchannel')
		.add('welcomeMessage', 'string')
		.add('dismissUsers', 'boolean', { default: false })
		.add('goodbyeChannel', 'textchannel')
		.add('goodbyeMessage', 'string'))
	.add('filters', folder => folder
		.add('wordBlacklistEnabled', 'boolean', { default: false })
		.add('antiInviteEnabled', 'boolean', { default: false })
		.add('warn', 'boolean', { default: false })
		.add('delete', 'boolean', { default: false })
		.add('checkDisplayNames', 'boolean', { default: false })
		.add('modBypass', 'boolean', { default: false })
		.add('words', 'string', { array: true })
		.add('inviteWhitelist', 'string', { array: true }))
	.add('moderation', folder => folder
		.add('notifyUser', 'boolean', { defualt: false }));

class Bot extends Client {}

new Bot(config).login(token);
