const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberAdd' });
	}

	async run(member) {
		if (!member.guild) return;

		const modHistory = await this.client.settings.get('moderation.cases').filter(modCase => modCase.user === member.id && modCase.guild === member.guild.id);
		for (const modCase of modHistory) {
			if (!member.settings.get('moderation.cases').includes(modCase.id)) {
				await member.settings.sync();
				await member.settings.update('moderation.cases', modCase.id, member.guild);
			}
		}

		if (member.guild.settings.get('greetings.welcomeNewUsers')) await this.welcome(member);
		if (member.guild.settings.get('channels.log') && member.guild.settings.get('logs.events.guildMemberAdd')) await this.serverLog(member);

		return;
	}

	async welcome(member) {
		if (!member.guild.settings.get('greetings.welcomeMessage')) return;

		const welcomeChannel = await this.client.channels.get(member.guild.settings.get('greetings.welcomeChannel'));
		let welcomeMsg = member.guild.settings.get('greetings.welcomeMessage');

		if (member.guild.settings.get('greetings.welcomeMessage')) {
			welcomeMsg = welcomeMsg.replace('%user%', `${member.user}`);
			await welcomeChannel.send(welcomeMsg);
		}
	}

	async serverLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.green'))
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		const { verboseLogging } = member.guild.settings.get('logs');
		if (verboseLogging) await embed.addField(member.guild.language.get('REGISTERED'), moment.tz(member.user.createdTimestamp, member.guild.settings.get('timezone')).format('Do MMMM YYYY, h:mmA zz'));

		const logChannel = await this.client.channels.get(member.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
