const { KlasaClient } = require('klasa');

module.exports = KlasaClient.defaultPermissionLevels
	.add(0, () => true)
	.add(6, ({ guild, member }) => guild && member.roles.cache.has(guild.settings.roles.moderator), { fetch: true })
	.add(7, ({ guild, member }) => guild && member.roles.cache.has(guild.settings.roles.administrator), { fetch: true })
	.add(8, ({ guild, member }) => guild && member === guild.owner, { fetch: true })
	.add(9, ({ author, client, guild }) => guild.settings.developmentSettings.developersAreSuperUsers && client.options.botOwners.includes(author.id), { break: true })
	.add(10, ({ author, client, guild }) => guild.settings.developmentSettings.developersAreSuperUsers && client.options.botOwners.includes(author.id));
