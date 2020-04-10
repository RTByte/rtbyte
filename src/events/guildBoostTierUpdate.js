const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBoostTierUpdate' });
	}

	async run(guild) {
		if (!guild.settings.channels.log && !guild.settings.logs.events.guildBoostTierUpdate) return;

		const nitroEmbed = new MessageEmbed()
			.setAuthor(guild.name, guild.iconURL())
			.setColor(this.client.settings.colors.pink)
			.addField(guild.language.get('GUILD_LOG_BOOSTTIER_TITLES', guild), guild.language.get('GUILD_LOG_BOOSTTIER_DETAILS', guild))
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_BOOSTTIER'));

		const logChannel = await this.client.channels.get(guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: nitroEmbed });
		return;
	}

};
