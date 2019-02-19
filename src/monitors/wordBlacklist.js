const { Monitor } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild.settings.wordBlacklist.enabled || !msg.guild.settings.wordBlacklist.words.length) return;
		const words = msg.content.split(' ');
		const wordBlacklist = msg.guild.settings.wordBlacklist.words;

		if (!await this.cycleWords(words, wordBlacklist)) return;

		if (msg.guild.settings.logs.blacklistedWord) await this.blacklistedWordLog(msg);
		if (msg.guild.settings.wordBlacklist.warn) await this.warnUser(msg);
		if (msg.guild.settings.wordBlacklist.delete) await msg.delete();
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
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.avatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(msg.guild.language.get('GUILD_LOG_REASON'), msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', msg.channel))
			.setFooter(msg.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		await msg.author.send(msg.guild.language.get('COMMAND_MODERATION_BOILERPLATE', msg.guild), { disableEveryone: true, embed: embed });
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
