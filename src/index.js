const { Client } = require('klasa');
const { config, token } = require('./config');

// Defining global variables
Client.defaultClientSchema
	.add('guilds', folder => folder
		.add('controlGuild', 'guild', { default: '450163430373064704' }))
	.add('channels', folder => folder
		.add('globalLog', 'textchannel', { default: '450829695513001984' }))
	.add('emoji', folder => folder
		.add('affirm', 'string')
		.add('reject', 'string'))
	.add('logs', folder => folder
		.add('botReady', 'boolean', { default: true })
		.add('commandRun', 'boolean', { default: true }))
	.add('colors', folder => folder
		.add('white', 'string', { default: '#FFFFFF' })
		.add('red', 'string', { default: '#FF9B9B' })
		.add('green', 'string', { default: '#9BFF9B' })
		.add('yellow', 'string', { default: '#FFFF9B' })
		.add('blue', 'string', { default: '#9B9BFF' }));

// Defining default guild variables.
Client.defaultGuildSchema
	.add('channels', folder => folder
		.add('log', 'TextChannel'))
	.add('roles', folder => folder
		.add('administrator', 'role')
		.add('moderator', 'role')
		.add('muted', 'role'))
	.add('logs', folder => folder
		.add('guildMemberMute', 'boolean'));

class Bot extends Client {}

new Bot(config).login(token);