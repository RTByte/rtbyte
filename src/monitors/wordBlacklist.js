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
		if (!msg.guild.settings.get('filters.wordBlacklistEnabled') || !msg.guild.settings.get('filters.words').length) return;
		// eslint-disable-next-line max-len
		if (msg.guild.settings.get('filters.modBypass') && (msg.member.roles.cache.has(msg.guild.settings.get('roles.moderator')) || msg.member.roles.cache.has(msg.guild.settings.get('roles.administrator')))) return;
		const sentence = msg.content;
		const blacklist = msg.guild.settings.get('filters.words');

		if (!await this.checkMessage(sentence, blacklist)) return;

		const modCase = new ModCase(msg.guild)
			.setUser(msg.author)
			.setType('blacklistedWord')
			.setModerator(this.client.user)
			.setReason(msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', msg.channel))
			.setMessageContent(msg.content);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		if (msg.guild.settings.get('filters.delete')) await msg.delete();

		const antiInvite = this.client.monitors.get('antiInvite');
		const punishment = msg.guild.settings.get('filters.wordBlacklistPunishment');
		if (punishment === 'mute') antiInvite.punishmentMute(msg);
		if (punishment === 'kick') antiInvite.punishmentKick(msg);
		if (punishment === 'softban') antiInvite.punishmentSoftban(msg);
		if (punishment === 'ban') antiInvite.punishmentBan(msg);

		return;
	}

	async checkMessage(sentence, blacklist) {
		let hasBlacklistedWord = false;
		let regex;

		for (let i = 0; i < blacklist.length; i++) {
			regex = new RegExp(`${blacklist[i]}`);
			if (sentence.toLowerCase().match(regex)) hasBlacklistedWord = true;
		}

		return hasBlacklistedWord;
	}

};
