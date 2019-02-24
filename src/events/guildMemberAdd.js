const { Event, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(guildMember) {
		if (guildMember.guild.available && guildMember.guild.settings.welcomeNewUsers) await this.welcome(guildMember);
		if (guildMember.guild.available && guildMember.guild.settings.logs.events.guildMemberAdd) await this.newMemberLog(guildMember);

		return;
	}

	async newMemberLog(guildMember) {
		const embed = new MessageEmbed()
			.setAuthor(`${guildMember.user.tag} (${guildMember.id})`, guildMember.user.displayAvatarURL())
			.setColor(this.client.settings.colors.green)
			.setTimestamp()
			.setFooter(guildMember.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		if (guildMember.guild.settings.logs.verboseLogging) {
			embed.addField(guildMember.guild.language.get('GUILD_LOG_GUILDMEMBERADD_V_REGISTERED'), this.timestamp.displayUTC(guildMember.user.createdAt));
		}

		const logChannel = await this.client.channels.get(guildMember.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async welcome(guildMember) {
		if (!guildMember.guild.settings.greetings.welcomeMessage) return;
		// TODO: Parse welcome messages
	}

};
