const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBoostAdd' });
	}

	async run(member) {
		if (!member.guild.settings.channels.log && !member.guild.settings.logs.events.guildBoostAdd) return;

		const embed = new MessageEmbed()
			.setAuthor(`${member.displayName} (${member.user.tag}) `, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.pink)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_BOOSTADD'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
