const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberRemove'	});
	}

	async run(member) {
		if (member.guild.available && member.guild.settings.greetings.dismissUsers) await this.dismiss(member);
		if (member.guild.available && member.guild.settings.logs.events.guildMemberRemove) await this.leaveLog(member);

		return;
	}

	async leaveLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERREMOVE'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async dismiss(member) {
		if (!member.guild.settings.greetings.goodbyeMessage) return;

		// const goodbyeChannel = await this.client.channels.get(member.guild.settings.greetings.goodbyeChannel);
		// if (member.guild.settings.greetings.goodbyeMessage) await goodbyeChannel.send(member.guild.settings.greetings.goodbyeMessage);
	}

};
