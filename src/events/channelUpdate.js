const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(oldChannel, channel) {
		if (!channel.guild) return;
		if (channel.guild.available && channel.guild.configs.logs.channelUpdate) await this.channelUpdateLog(oldChannel, channel);

		return;
	}

	async channelUpdateLog(oldChannel, channel) {
		const embed = new MessageEmbed()
			.setAuthor(`${channel.name}`, channel.guild.iconURL())
			.setColor('#4286f4')
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE'));

		if (oldChannel.name !== channel.name) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NAME'), `${oldChannel.name} ➡️ ${channel.name}`);
		if (oldChannel.nsfw !== channel.nsfw) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NSFW'));
		if (oldChannel.topic !== channel.topic) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_TOPIC'), `${oldChannel.topic} ➡️ ${channel.topic}`);

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
		if (!this.client.gateways.guilds.schema.logs.has('channelUpdate')) await this.client.gateways.guilds.schema.logs.add('channelUpdate', { type: 'Boolean', array: false, default: false });
		return;
	}

};
