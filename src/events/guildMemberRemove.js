const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberRemove'	});
	}

	async run(guildMember) {
		if (guildMember.guild.available && guildMember.guild.settings.greetings.dismissUsers) await this.dismiss(guildMember);
		if (guildMember.guild.available && guildMember.guild.settings.logs.events.guildMemberRemove) await this.leaveLog(guildMember);

		return;
	}

	async leaveLog(guildMember) {
		const embed = new MessageEmbed()
			.setAuthor(`${guildMember.user.tag} (${guildMember.id})`, guildMember.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.setFooter(guildMember.guild.language.get('GUILD_LOG_GUILDMEMBERREMOVE'));

		const logChannel = await this.client.channels.get(guildMember.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async dismiss(guildMember) {
		if (!guildMember.guild.settings.greetings.goodbyeMessage) return;
		// TODO: Parse goodbye messages
	}

};
