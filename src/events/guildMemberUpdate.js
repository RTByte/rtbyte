const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const alternateNames = [
	'Not having any of this',
	'Embodiment of Rock \'n Roll',
	'Not happening',
	'Nope.',
	'Try again, bud',
	'Nice try',
	'Bad person'
];

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberUpdate'	});
	}

	async run(oldMember, member) {
		if (member.guild.available && member.guild.settings.logs.events.guildMemberUpdate) await this.memberUpdateLog(oldMember, member);
		if (member.guild.settings.wordBlacklist.checkDisplayNames) await this.autoSelener(member);
		return;
	}

	async memberUpdateLog(oldMember, member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.displayName} (${member.user.tag}) `, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_MEMBERUPDATE'));

		if (oldMember.displayName !== member.displayName) embed.addField(member.guild.language.get('GUILD_LOG_MEMBERUPDATE_DISPLAYNAME'), `${oldMember.displayName} <:arrowRight:547464582739001384> ${member.displayName}`);

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async autoSelener(member) {
		const words = member.displayName.split(' ');

		const wordBlacklist = this.client.monitors.get('wordBlacklist');
		if (!await wordBlacklist.cycleWords(words, member.guild.settings.wordBlacklist.words)) return;

		const oldName = member.displayName;
		await member.setNickname(alternateNames[`${Math.floor(Math.random() * alternateNames.length)}`]);

		if (member.guild.settings.logs.blacklistedNickname) await this.autoSelenerLog(oldName, member);
		if (member.guild.settings.wordBlacklist.warn) await this.warnUser(member);
		return;
	}

	async autoSelenerLog(oldName, member) {
		const newMember = await member.guild.members.get(member.id);
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('DISPLAY_NAME'), `${oldName} <:arrowRight:547464582739001384> ${newMember.displayName}`)
			.setFooter(member.guild.language.get('GUILD_LOG_AUTOSELENER'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async warnUser(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), member.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', 'nickname'))
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		await member.user.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async blacklistedWordLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.avatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField('Message', msg.content)
			.setFooter(message.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', msg.channel));

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
