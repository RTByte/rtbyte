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
		if (member.guild.settings.filters.checkDisplayNames) await this.autoSelener(member);
		return;
	}

	async memberUpdateLog(oldMember, member) {
		const oldRoleCollection = oldMember.roles.reduce((userRoles, roles) => {
			if (!roles.name.includes('everyone')) {
				userRoles.push(roles);
			}
			return userRoles;
		}, []);
		const newRoleCollection = member.roles.reduce((userRoles, roles) => {
			if (!roles.name.includes('everyone')) {
				userRoles.push(roles);
			}
			return userRoles;
		}, []);

		const oldActualRoles = oldRoleCollection.map(userRoles => `${userRoles}`).join(', ');
		const newActualRoles = newRoleCollection.map(userRoles => `${userRoles}`).join(', ');

		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);

		const embed = new MessageEmbed()
			.setAuthor(`${member.displayName} (${member.user.tag}) `, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_MEMBERUPDATE'));

		if (oldMember.displayName !== member.displayName) await embed.addField(member.guild.language.get('GUILD_LOG_MEMBERUPDATE_DISPLAYNAME'), `${oldMember.displayName} ${arrowRightEmoji} ${member.displayName}`); // eslint-disable-line
		if (oldActualRoles !== newActualRoles) {
			await embed.addField(member.guild.language.get('GUILD_LOG_BEFORE'), oldActualRoles.length < 1 ? oldMember.roles.map(roles => `${roles}`).join(', ') : oldActualRoles);
			await embed.addField(member.guild.language.get('GUILD_LOG_AFTER'), newActualRoles.length > 1 ? newActualRoles : member.roles.map(roles => `${roles}`).join(', '));
		}

		if (!embed.fields.length) return;

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async autoSelener(member) {
		const words = member.displayName.split(' ');

		const wordBlacklist = this.client.monitors.get('wordBlacklist');
		if (!await wordBlacklist.cycleWords(words, member.guild.settings.filters.words)) return;

		const oldName = member.displayName;
		await member.setNickname(alternateNames[`${Math.floor(Math.random() * alternateNames.length)}`]);

		if (member.guild.settings.logs.blacklistedNickname) await this.autoSelenerLog(oldName, member);
		if (member.guild.settings.filters.warn) await this.warnUser(member);
		return;
	}

	async autoSelenerLog(oldName, member) {
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);

		const newMember = await member.guild.members.get(member.id);
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('DISPLAY_NAME'), `${oldName} ${arrowRightEmoji} ${newMember.displayName}`)
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
		await member.user.send(member.guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async blacklistedWordLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.avatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField('Message', msg.content)
			.setFooter(msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', msg.channel));

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
