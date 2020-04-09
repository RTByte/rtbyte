const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildDelete' });
	}

	async run(guild) {
		if (this.client.ready && guild.available && !this.client.options.preserveSettings) guild.settings.destroy().catch(() => null);
		if (this.client.settings.get('logs.guildDelete')) await this.serverLog(guild);

		return;
	}

	async serverLog(guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} (${guild.id})`, guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(guild.language.get('GLOBAL_LOG_GUILDDELETE'));

		const globalLogChannel = await this.client.channels.get(this.client.settings.get('channels.globalLog'));
		await globalLogChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
