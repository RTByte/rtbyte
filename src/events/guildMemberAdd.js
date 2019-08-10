const { Event, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(member) {
		const modHistory = await this.client.settings.moderation.cases.filter(modCase => modCase.user === member.id && modCase.guild === member.guild.id);
		for await (const modCase of modHistory) {
			if (!member.settings.moderation.cases.includes(modCase.id)) member.settings.update('moderation.cases', modCase.id, member.guild);
		}

		if (member.guild.available && member.guild.settings.greetings.welcomeNewUsers) await this.welcome(member);
		if (member.guild.available && member.guild.settings.logs.events.guildMemberAdd) await this.newMemberLog(member);

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

	async newMemberLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.green)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		if (member.guild.settings.logs.verboseLogging) await embed.addField(member.guild.language.get('REGISTERED'), `${this.timestamp.displayUTC(member.user.createdAt)} (UTC)`);

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
