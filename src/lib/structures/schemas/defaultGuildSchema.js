const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultGuildSchema
	// Unmanagable
	.add('initialization', folder => folder
		.add('serverInitialized', 'boolean', { default: false, configurable: false })
		.add('ownerInformed', 'boolean', { default: false, configurable: false }))
	// Managed by -settings
	.add('developmentSettings', folder => folder
		.add('developersAreSuperUsers', 'boolean', { default: false })
		.add('commandAnalytics', 'boolean', { default: true }))
	// Managed by -logs
	.add('channels', folder => folder.add('log', 'textchannel'))
	// Managed by -settings
	.add('roles', folder => folder
		.add('administrator', 'role')
		.add('moderator', 'role')
		.add('muted', 'role')
		.add('voiceBanned', 'role')
		.add('joinable', 'role', { array: true }))
	.add('logs', folder => folder
		// Managed by -logs
		.add('events', subfolder => subfolder
			.add('channelCreate', 'boolean', { default: false })
			.add('channelDelete', 'boolean', { default: false })
			.add('channelUpdate', 'boolean', { default: false })
			.add('commandRun', 'boolean', { default: false })
			.add('customCmdCreate', 'boolean', { default: false })
			.add('customCmdDelete', 'boolean', { default: false })
			.add('customCmdUpdate', 'boolean', { default: false })
			.add('autoresponseCreate', 'boolean', { default: false })
			.add('autoresponseDelete', 'boolean', { default: false })
			.add('autoresponseUpdate', 'boolean', { default: false })
			.add('emojiCreate', 'boolean', { default: false })
			.add('emojiDelete', 'boolean', { default: false })
			.add('emojiUpdate', 'boolean', { default: false })
			.add('guildUpdate', 'boolean', { default: true })
			.add('guildMemberAdd', 'boolean', { default: true })
			.add('guildBotAdd', 'boolean', { default: true })
			.add('guildMemberRemove', 'boolean', { default: true })
			.add('guildMemberUpdate', 'boolean', { default: true })
			.add('guildBoostAdd', 'boolean', { default: true })
			.add('guildBoostRemove', 'boolean', { default: true })
			.add('guildBoostTierUpdate', 'boolean', { default: true })
			.add('inviteCreate', 'boolean', { default: false })
			.add('inviteDelete', 'boolean', { default: false })
			.add('messageDelete', 'boolean', { default: true })
			.add('messageUpdate', 'boolean', { default: true })
			.add('roleCreate', 'boolean', { default: false })
			.add('roleDelete', 'boolean', { default: false })
			.add('roleUpdate', 'boolean', { default: false })
			.add('webhookCreate', 'boolean', { default: false })
			.add('webhookDelete', 'boolean', { default: false })
			.add('webhookUpdate', 'boolean', { default: false }))
		// Managed by -moderation
		.add('moderation', subfolder => subfolder
			.add('ban', 'boolean', { default: true })
			.add('unban', 'boolean', { default: true })
			.add('kick', 'boolean', { default: true })
			.add('mute', 'boolean', { default: true })
			.add('unmute', 'boolean', { default: true })
			.add('purge', 'boolean', { default: true })
			.add('softban', 'boolean', { default: true })
			.add('vcban', 'boolean', { default: true })
			.add('vcunban', 'boolean', { default: true })
			.add('vckick', 'boolean', { default: true })
			.add('antiInvite', 'boolean', { default: true })
			.add('mentionSpam', 'boolean', { default: true })
			.add('blacklistedWord', 'boolean', { default: true })
			.add('blacklistedNickname', 'boolean', { default: true })
			.add('warn', 'boolean', { default: true })))
	// Managed by -greetings
	.add('greetings', folder => folder
		.add('welcomeNewUsers', 'boolean', { default: false })
		.add('welcomeChannel', 'textchannel')
		.add('welcomeMessage', 'string')
		.add('dismissUsers', 'boolean', { default: false })
		.add('dismissChannel', 'textchannel')
		.add('dismissMessage', 'string'))
	// Managed by -filters
	.add('filters', folder => folder
		.add('wordBlacklistEnabled', 'boolean', { default: false })
		.add('antiInviteEnabled', 'boolean', { default: false })
		.add('mentionSpamEnabled', 'boolean', { default: false })
		.add('wordBlacklistPunishment', 'string')
		.add('antiInvitePunishment', 'string')
		.add('mentionSpamPunishment', 'string')
		.add('modBypass', 'boolean', { default: false })
		.add('delete', 'boolean', { default: false })
		.add('checkDisplayNames', 'boolean', { default: false })
		.add('words', 'string', { array: true })
		.add('inviteWhitelist', 'string', { array: true })
		.add('mentionSpamThreshold', 'integer', { default: 12, min: 2, max: 90 }))
	// Managed by -moderation
	.add('moderation', folder => folder
		.add('notifyUser', 'boolean', { default: false }))
	.add('commands', folder => folder
		// Managed by -settings
		.add('serverinfoExtendedOutput', 'boolean', { default: false })
		// Managed by -customcmds
		.add('customCommandsEnabled', 'boolean', { default: false })
		.add('customCommands', 'any', { array: true, configurable: false }))
	.add('boards', folder => folder
		// Managed by -starboard
		.add('starboard', subfolder => subfolder
			.add('starred', 'any', { array: true, configurable: false })
			.add('starboardEnabled', 'boolean', { default: false })
			.add('starboardThreshold', 'integer', { min: 1, default: 2 })
			.add('starboardChannel', 'textchannel')
			.add('starboardIgnoredChannels', 'textchannel', { array: true }))
		// Managed by -pinboard
		.add('pinboard', subfolder => subfolder
			.add('pinned', 'any', { array: true, configurable: false })
			.add('pinboardEnabled', 'boolean', { default: false })
			.add('pinboardChannel', 'textchannel')
			.add('pinboardIgnoredChannels', 'textchannel', { array: true })))
	// Managed by -twitch
	.add('twitch', folder => folder
		.add('twitchNotifsEnabled', 'boolean', { default: false })
		.add('twitchTaskID', 'string', { configurable: false })
		.add('twitchNotifsChannel', 'textchannel')
		.add('twitchNotifsRole', 'role')
		.add('streamers', 'any', { array: true, configurable: false }))
	// Managed by -autoresponder
	.add('autoresponder', folder => folder
		.add('autoresponses', 'any', { array: true, configurable: false })
		.add('autoresponderEnabled', 'boolean', { default: false })
		.add('autoresponderIgnoredChannels', 'textchannel', { array: true }))
	// Managed by -settings
	.add('measurementUnits', 'string', { default: 'metric' })
	.add('timezone', 'string', { default: 'Europe/London' });
