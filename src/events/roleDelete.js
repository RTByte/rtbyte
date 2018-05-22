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
		if (role.guild.available && role.guild.configs.logs.roleDelete) await this.roleDeleteLog(role);

		return;
	}

	async roleDeleteLog(role) {
		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor('#ff9b9b')
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEDELETE'));

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
		if (!this.client.gateways.guilds.schema.logs.has('roleDelete')) await this.client.gateways.guilds.schema.logs.add('roleDelete', { type: 'Boolean', array: false, default: false });
		return;
	}

};
