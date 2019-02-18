const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'channelUpdate'	});
		this.status = {
			true: 'Enabled',
			false: 'Disabled',
		};
	}

	async run(oldChannel, channel) {
		if (!channel.guild) return;
		if (channel.guild.available && channel.guild.settings.logs.channelUpdate) await this.channelUpdateLog(oldChannel, channel);

		return;
	}

	async channelUpdateLog(oldChannel, channel) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.colors.white)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE'));

		if (oldChannel.name !== channel.name) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NAME'), `${oldChannel.name} ➡️ ${channel.name}`);
		if (oldChannel.nsfw !== channel.nsfw) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NSFW'), this.status[channel.nsfw]);
		if (oldChannel.topic !== channel.topic) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_TOPIC'), `${oldChannel.topic} ➡️ ${channel.topic}`);

		const logChannel = await this.client.channels.get(channel.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
