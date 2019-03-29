const { Event, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(member) {
		if (member.guild.available && member.guild.settings.greetings.welcomeNewUsers) await this.welcome(member);
		if (member.guild.available && member.guild.settings.logs.events.guildMemberAdd) await this.newMemberLog(member);

		return;
	}

	async newMemberLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.green)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		if (member.guild.settings.logs.verboseLogging) await embed.addField(member.guild.language.get('GUILD_LOG_GUILDMEMBERADD_V_REGISTERED'), this.timestamp.displayUTC(member.user.createdAt));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async welcome(member) {
		if (!member.guild.settings.greetings.welcomeMessage) return;

		const welcomeChannel = await this.client.channels.get(member.guild.settings.greetings.welcomeChannel);
		let welcomeMsg = member.guild.settings.greetings.welcomeMessage;

		if (member.guild.settings.greetings.welcomeMessage) {
			welcomeMsg = welcomeMsg.replace('%user%', `${member.user}`);
			await welcomeChannel.send(welcomeMsg);
		}
	}

};
