const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(channel) {
		if (!channel.guild) return;
		if (channel.guild.available && channel.guild.configs.logs.channelDelete) await this.channelDeleteLog(channel);

		return;
	}

	async channelDeleteLog(channel) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.configs.colors.blurple)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE'));

		const logChannel = await this.client.channels.get(channel.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('channelDelete')) await this.client.gateways.guilds.schema.logs.add('channelDelete', { type: 'Boolean', array: false, default: false });
		return;
	}

};
