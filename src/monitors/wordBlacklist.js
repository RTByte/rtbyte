const { Monitor } = require('klasa');
const { MessageEmbed } = require('discord.js');
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
		if (!msg.guild.settings.filters.wordBlacklistEnabled || !msg.guild.settings.filters.words.length) return;
		if (msg.guild.settings.filters.modBypass && msg.member.roles.has(msg.guild.settings.roles.moderator)) return;
		const words = msg.content.split(' ');
		const wordBlacklist = msg.guild.settings.filters.words;

		if (!await this.cycleWords(words, wordBlacklist)) return;

		const modCase = new ModCase(msg.guild)
			.setUser(msg.author)
			.setType('blacklistedWord')
			.setModerator(this.client.user)
			.setMessageContent(msg.content);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		await msg.delete();
		return;
	}

	async cycleWords(words, wordBlacklist) {
		let hasBlacklistedWord = false;

		for (let i = 0; i < words.length; i++) {
			if (wordBlacklist.includes(words[i].toLowerCase())) hasBlacklistedWord = true;
		}

		return hasBlacklistedWord;
	}

	async warnUser(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(msg.guild.language.get('GUILD_LOG_REASON'), msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', msg.channel))
			.setFooter(msg.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		await msg.author.send(msg.guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', msg.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async blacklistedWordLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField('Message', msg.content)
			.setFooter(msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', msg.channel));

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
