const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBotAdd' });
	}

	async run(member, executor) {
		if (!member.guild) return;

		if (member.guild.settings.get('channels.log') && member.guild.settings.get('logs.events.guildBotAdd') && member.user.bot) await this.serverLog(member, executor);
	}

	async serverLog(member, executor) {
		const botBadgeEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.botBadge'));

		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.green'))
			.setDescription(botBadgeEmoji)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDBOTADD', executor), executor.displayAvatarURL());

		const logChannel = await this.client.channels.cache.get(member.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
