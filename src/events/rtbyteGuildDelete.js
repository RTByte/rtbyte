const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { Colors } = require('../lib/util/constants');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildDelete' });
	}

	async run(guild) {
		if (this.client.settings.get('logs.guildDelete')) await this.globalLog(guild);

		return;
	}

	async globalLog(guild) {
		const embed = new MessageEmbed()
			.setAuthor(`${guild.name} (${guild.id})`, guild.iconURL())
			.setColor(Colors.red)
			.setTimestamp()
			.setFooter(guild.language.get('GLOBAL_LOG_GUILDDELETE'));

		const globalLogChannel = await this.client.channels.cache.get(this.client.settings.get('channels.globalLog'));
		if (globalLogChannel) await globalLogChannel.send('', { embed: embed });

		return;
	}

};
