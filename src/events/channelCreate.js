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
		if (channel.guild.available && channel.guild.configs.logs.channelCreate) await this.newChannelLog(channel);

		return;
	}

	async newChannelLog(channel) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor('#60fe60')
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELCREATE'));

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
		if (!this.client.gateways.guilds.schema.logs.has('channelCreate')) await this.client.gateways.guilds.schema.logs.add('channelCreate', { type: 'Boolean', array: false, default: false });
		return;
	}

};
