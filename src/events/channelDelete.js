const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'channelDelete' });
	}

	async run(channel) {
		if (!channel.guild) return;
		if (channel.guild.available && channel.guild.settings.logs.events.channelDelete) await this.channelDeleteLog(channel);

		return;
	}

	async channelDeleteLog(channel) {
		const embed = new MessageEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE'));

		// Change author and footer fields if channel is voice channel
		if (channel.type === 'voice') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_VOICE'));
		}

		// Change author and footer fields if channel is category
		if (channel.type === 'category') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_CATEGORY'));
		}

		// Change author and footer fields if channel is news channel
		if (channel.type === 'news') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_NEWS'));
		}

		// Change author and footer fields if channel is store channel
		if (channel.type === 'store') {
			embed.setAuthor(channel.name, channel.guild.iconURL());
			embed.setFooter(channel.guild.language.get('GUILD_LOG_CHANNELDELETE_STORE'));
		}

		if (channel.guild.settings.logs.verboseLogging) {
			embed.addField(channel.guild.language.get('ID'), channel.id);
			embed.addField(channel.guild.language.get('GUILD_LOG_CHANNELCREATE_V_PARENT'), channel.parent);
		}
		const logChannel = await this.client.channels.get(channel.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
