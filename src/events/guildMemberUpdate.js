const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { ModCase } = require('../index');

const alternateNames = [
	'Not having any of this',
	'Embodiment of Rock \'n Roll',
	'Not happening',
	'Nope.',
	'Try again, bud',
	'Nice try',
	'Bad person',
	'Assclown',
	'Idiot',
	'Dummy',
	'Shithead',
	'Fuckface',
	'Don\'t',
	'Stop'
];

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildMemberUpdate'	});
	}

	async run(oldMember, member) {
		if (!member.guild) return;

		let executor;
		if (member.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
			const auditLog = await member.guild.fetchAuditLogs();
			const logEntry = await auditLog.entries.first();

			if (logEntry.action === 'MEMBER_UPDATE') executor = logEntry ? logEntry.executor === member.user ? undefined : logEntry.executor : undefined;
		}

		if (member.guild.settings.get('channels.log') && member.guild.settings.get('logs.events.guildMemberUpdate')) await this.serverLog(oldMember, member, executor);
		if (member.guild.settings.get('filters.checkDisplayNames')) await this.autoSelener(member);

		if (!oldMember.premiumSince && member.premiumSince) this.client.emit('guildBoostAdd', member);
		if (oldMember.premiumSince && !member.premiumSince) this.client.emit('guildBoostRemove', member);

		return;
	}

	async serverLog(oldMember, member, executor) {
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.get('emoji.arrowRight'));

		// Filter the user's roles and remove the @everyone role
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

		// Map the filtered roles
		const oldActualRoles = oldRoleCollection.map(userRoles => `${userRoles}`).join(', ');
		const newActualRoles = newRoleCollection.map(userRoles => `${userRoles}`).join(', ');

		// Base embed
		const embed = new MessageEmbed()
			.setAuthor(`${member.displayName} (${member.user.tag}) `, member.user.displayAvatarURL())
			.setColor(this.client.settings.get('colors.blue'))
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_MEMBERUPDATE', executor), executor ? executor.displayAvatarURL() : undefined);

		// User display name changed
		// eslint-disable-next-line max-len
		if (oldMember.displayName !== member.displayName) await embed.addField(member.guild.language.get('GUILD_LOG_MEMBERUPDATE_DISPLAYNAME'), `${oldMember.displayName} ${arrowRightEmoji} ${member.displayName}`);

		// User roles changed
		if (oldActualRoles !== newActualRoles) {
			await embed.addField(member.guild.language.get('GUILD_LOG_BEFORE'), oldActualRoles.length < 1 ? oldMember.roles.map(roles => `${roles}`).join(', ') : oldActualRoles);
			await embed.addField(member.guild.language.get('GUILD_LOG_AFTER'), newActualRoles.length > 1 ? newActualRoles : member.roles.map(roles => `${roles}`).join(', '));
		}

		// Return nothing if no fields are populated
		if (!embed.fields.length) return;

		const logChannel = await this.client.channels.get(member.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

	async autoSelener(member) {
		if (!member.manageable) return;

		const name = member.displayName;

		const wordBlacklist = this.client.monitors.get('wordBlacklist');
		if (!await wordBlacklist.checkMessage(name, member.guild.settings.get('filters.words'))) return;

		const oldName = member.displayName;
		await member.setNickname(alternateNames[`${Math.floor(Math.random() * alternateNames.length)}`]);

		const modCase = new ModCase(member.guild)
			.setUser(member.user)
			.setType('blacklistedNickname')
			.setModerator(this.client.user)
			.setBadNickname(oldName);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		return;
	}

};
