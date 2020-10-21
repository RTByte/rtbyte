const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../lib/util/constants');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBoostTierUpdate' });
	}

	async run(guild) {
		if (guild.settings.get('channels.log') && guild.settings.get('logs.events.guildBoostTierUpdate')) await this.serverLog(guild);

		return;
	}

	async serverLog(guild) {
		const nitroEmbed = new MessageEmbed()
			.setAuthor(guild.name, guild.iconURL())
			.setColor(Colors.pink)
			.addField(guild.language.get('GUILD_LOG_BOOSTTIER_TITLES', guild), guild.language.get('GUILD_LOG_BOOSTTIER_DETAILS', guild))
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_BOOSTTIER'));

		const logChannel = await this.client.channels.cache.get(guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: nitroEmbed });

		return;
	}

};
