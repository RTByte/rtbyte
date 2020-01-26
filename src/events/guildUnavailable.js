const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildUnavailable' });
	}

	async run(guild) {
		if (this.client.settings.get('logs.guildUnavailable')) await this.guildUnavailableLog(guild);

		return;
	}

	async guildUnavailableLog(guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} (${guild.id})`, guild.iconURL())
			.setColor(this.client.settings.get('colors.yellow'))
			.setTimestamp()
			.setFooter(guild.language.get('GLOBAL_LOG_GUILDUNAVAILABLE'));

		const globalLogChannel = await this.client.channels.get(this.client.settings.get('channels.globalLog'));
		await globalLogChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
