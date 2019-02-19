const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'channelUpdate'	});
		this.status = {
			true: '<:affirm:547464582763905033>',
			false: '<:reject:547464582780944384>'
		};
	}

	async run(oldChannel, channel) {
		if (!channel.guild) return;
		if (channel.guild.available && channel.guild.settings.logs.events.channelUpdate) await this.channelUpdateLog(oldChannel, channel);

		return;
	}

	async channelUpdateLog(oldChannel, channel) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE'));

		if (oldChannel.name !== channel.name) embed.addField(channel.guild.language.get('GUILD_LOG_UPDATE_NAME'), `${oldChannel.name} <:arrowRight:547464582739001384> ${channel.name}`);
		if (oldChannel.nsfw !== channel.nsfw) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_NSFW'), this.status[channel.nsfw]);
		if (oldChannel.topic !== channel.topic) embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELUPDATE_TOPIC'), `${oldChannel.topic} <:arrowRight:547464582739001384> ${channel.topic}`);

		const logChannel = await this.client.channels.get(channel.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
