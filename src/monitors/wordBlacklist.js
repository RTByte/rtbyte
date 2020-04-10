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
		if (!msg.guild.settings.filters.wordBlacklistEnabled || !msg.guild.settings.filters.words.length) return;
		if (msg.guild.settings.filters.modBypass && (msg.member.roles.cache.has(msg.guild.settings.roles.moderator) || msg.member.roles.cache.has(msg.guild.settings.roles.administrator))) return;
		const sentence = msg.content;
		const blacklist = msg.guild.settings.filters.words;

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

		if (msg.guild.settings.filters.delete) await msg.delete();
		if (msg.guild.settings.filters.ban) await msg.member.ban({ days: 1, reason: msg.guild.language.get('MODERATION_LOG_BLACKLISTEDWORD') });
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
