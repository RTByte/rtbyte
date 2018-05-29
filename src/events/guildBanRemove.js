const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(guild, user) {
		if (guild.configs.logs.guildBanRemove) await this.unbanLog(guild, user);

		return;
	}

	async unbanLog(guild, user) {
		const embed = new MessageEmbed()
			.setAuthor(`${user.tag} - (${user.id})`, user.avatarURL())
			.setColor(this.client.configs.colors.yellow)
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_GUILDBANREMOVE'));

		const logChannel = await this.client.channels.get(guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('guildBanRemove')) await this.client.gateways.guilds.schema.logs.add('guildBanRemove', { type: 'Boolean', array: false, default: false });
		return;
	}

};
