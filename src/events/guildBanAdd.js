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
		if (guild.configs.logs.guildBanAdd) await this.banLog(guild, user);

		return;
	}

	async banLog(guild, user) {
		const bans = await guild.fetchBans();
		const banInfo = await bans.get(user.id);

		const embed = new MessageEmbed()
			.setAuthor(`${user.tag} - (${user.id})`, user.avatarURL())
			.setColor(this.client.configs.colors.red)
			.setTimestamp()
			.addField(guild.language.get('GUILD_LOG_REASON'), banInfo.reason)
			.setFooter(guild.language.get('GUILD_LOG_GUILDBANADD'));

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
		if (!this.client.gateways.guilds.schema.logs.has('guildBanAdd')) await this.client.gateways.guilds.schema.logs.add('guildBanAdd', { type: 'Boolean', array: false, default: true });
		return;
	}

};
