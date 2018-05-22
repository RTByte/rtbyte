const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(role) {
		if (role.guild.available && role.guild.configs.logs.roleCreate) await this.newRoleLog(role);

		return;
	}

	async newRoleLog(role) {
		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor('#60fe60')
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLECREATE'));

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
		if (!this.client.gateways.guilds.schema.logs.has('roleCreate')) await this.client.gateways.guilds.schema.logs.add('roleCreate', { type: 'Boolean', array: false, default: false });
		return;
	}

};
