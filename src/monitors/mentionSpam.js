const { Monitor } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreSelf: true,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild) return;
		if (!msg.guild.settings.get('filters.mentionSpamEnabled')) return;
		if (msg.guild.settings.get('filters.modBypass') && (msg.member.roles.has(msg.guild.settings.get('roles.moderator')) || msg.member.roles.has(msg.guild.settings.get('roles.administrator')))) return;

		const mentions = msg.mentions.users.size + msg.mentions.roles.size;

		if (mentions < msg.guild.settings.get('filters.mentionSpamThreshold')) return;
		const modCase = new ModCase(msg.guild)
			.setUser(msg.author)
			.setType('mentionSpam')
			.setModerator(this.client.user)
			.setMessageContent(msg.content);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		if (msg.guild.settings.get('filters.delete')) await msg.delete();

		const antiInvite = this.client.monitors.get('antiInvite');
		const punishment = msg.guild.settings.get('filters.mentionSpamPunishment');
		if (punishment === 'mute') antiInvite.punishmentMute(msg);
		if (punishment === 'kick') antiInvite.punishmentKick(msg);
		if (punishment === 'softban') antiInvite.punishmentSoftban(msg);
		if (punishment === 'ban') antiInvite.punishmentBan(msg);

		await msg.send(msg.guild.language.get('MONITOR_MENTIONSPAM_APOLOGY', msg.guild, punishment));

		return;
	}

};
