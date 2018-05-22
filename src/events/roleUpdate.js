const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(oldRole, role) {
		if (role.guild.available && role.guild.configs.logs.roleUpdate) await this.roleUpdateLog(oldRole, role);

		return;
	}

	async roleUpdateLog(oldRole, role) {
		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor('#4286f4')
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEUPDATE'));

		if (oldRole.name !== role.name) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_NAME'), `${oldRole.name} ➡️ ${role.name}`);
		if (oldRole.color !== role.color) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_COLOR'), `${oldRole.hexColor} ➡️ ${role.hexColor}`);
		if (oldRole.hoist !== role.hoist) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_HOIST'), `${oldRole.hoist} ➡️ ${role.hoist}`);
		if (oldRole.mentionable !== role.mentionable) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_MENTIONABLE'), `${oldRole.mentionable} ➡️ ${role.mentionable}`);
		if (oldRole.permissions.bitfield !== role.permissions.bitfield) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_PERMISSIONS'), `${oldRole.permissions.toArray().join(', ')} ➡️ ${role.permissions.toArray().join(', ')}`); // eslint-disable-line

		const logChannel = await this.client.channels.get(role.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('roleUpdate')) await this.client.gateways.guilds.schema.logs.add('roleUpdate', { type: 'Boolean', array: false, default: false });
		return;
	}

};
