const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBoostAdd' });
	}

	async run(member) {
		if (member.guild.settings.get('channels.log') && member.guild.settings.get('logs.events.guildBoostAdd')) await this.serverLog(member);

		return;
	}

	async serverLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.displayName} (${member.user.tag}) `, member.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.pink'))
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_BOOSTADD'));

		const logChannel = await this.client.channels.cache.get(member.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
