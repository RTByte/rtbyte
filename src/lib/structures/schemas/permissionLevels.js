const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultPermissionLevels
	.add(0, () => true)
	.add(6, ({ guild, member }) => guild && member.roles.cache.has(guild.settings.get('roles.moderator')), { fetch: true })
	.add(7, ({ guild, member }) => guild && member.roles.cache.has(guild.settings.get('roles.administrator')), { fetch: true })
	.add(8, ({ guild, member }) => guild && member === guild.owner, { fetch: true })
	// eslint-disable-next-line max-len
	.add(9, ({ client, guild, member }) => (guild.settings.get('developmentSettings.developersAreSuperUsers') || member.roles.cache.has(guild.settings.get('roles.administrator'))) && client.options.botOwners.includes(member.user.id), { break: true })
	// eslint-disable-next-line max-len
	.add(10, ({ client, guild, member }) => (guild.settings.get('developmentSettings.developersAreSuperUsers') || member.roles.cache.has(guild.settings.get('roles.administrator'))) && client.options.botOwners.includes(member.user.id));
