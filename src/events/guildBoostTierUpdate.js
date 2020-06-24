const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

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
			.setColor(this.client.settings.get('colors.pink'))
			.addField(guild.language.get('GUILD_LOG_BOOSTTIER_TITLES', guild), guild.language.get('GUILD_LOG_BOOSTTIER_DETAILS', guild))
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_BOOSTTIER'));

		const logChannel = await this.client.channels.get(guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: nitroEmbed });
		return;
	}

};
