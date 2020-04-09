const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberRemove'	});
	}

	async run(member) {
		if (!member.guild) return;

		if (member.guild.available && member.guild.settings.get('channels.log') && member.guild.settings.get('logs.events.guildMemberRemove')) await this.serverLog(member);

		if (member.guild.available && member.guild.settings.get('greetings.dismissUsers')) this.client.emit('guildMemberDismiss', member);

		return;
	}

	async serverLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERREMOVE'));

		const logChannel = await this.client.channels.get(member.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
