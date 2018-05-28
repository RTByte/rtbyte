const { Monitor } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			enabled: true,
			ignoreBots: true,
			ignoreSelf: true,
			ignoreOthers: true,
			ignoreWebhooks: true,
			ignoreEdits: false
		});
	}

	async run(msg) {
		console.log(`${msg.guild.configs.wordBlacklist.enabled}, ${msg.guild.configs.wordBlacklist.words.length}`);
		if (!msg.guild.configs.wordBlacklist.enabled || !msg.guild.configs.wordBlacklist.words.length) return;
		const words = msg.content.split(' ');
		console.log(`${msg.content}\n${words}`);
		const wordBlacklist = msg.guild.configs.wordBlacklist.words;

		if (!await this.cycleWords(words, wordBlacklist)) return;

		if (msg.guild.cofigs.logs.blacklistedWord) await this.blacklistedWordLog(msg);
		if (msg.guild.configs.wordBlacklist.warn) await this.warnUser(msg);
		if (msg.guild.configs.wordBlacklist.delete) await msg.delete();
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
			.setAuthor(`${msg.author.tag} - (${msg.author.id})`, msg.author.avatarURL())
			.setColor('#ff0000')
			.setTimestamp()
			.addField(msg.guild.language.get('GUILD_LOG_REASON'), msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD'))
			.setFooter(msg.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));

		const logChannel = await this.client.channels.get(msg.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		await msg.author.send(msg.guild.language.get('COMMAND_MODERATION_BOILERPLATE', msg.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async blacklistedWordLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} - (${msg.author.id})`, msg.author.avatarURL())
			.setColor('#ff0000')
			.setTimestamp()
			.addField('Message:', msg.content)
			.setFooter(msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD'));

		const logChannel = await this.client.channels.get(msg.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('blacklistedWord')) await this.client.gateways.guilds.schema.logs.add('blacklistedWord', { type: 'Boolean', array: false, default: true });
		if (!this.client.gateways.guilds.schema.has('wordBlacklist')) await this.client.gateways.guilds.schema.add('wordBlacklist');
		if (!this.client.gateways.guilds.schema.wordBlacklist.has('enabled')) await this.client.gateways.guilds.schema.wordBlacklist.add('enabled', { type: 'Boolean', array: false, default: false });
		if (!this.client.gateways.guilds.schema.wordBlacklist.has('warn')) await this.client.gateways.guilds.schema.wordBlacklist.add('warn', { type: 'Boolean', array: false, default: false });
		if (!this.client.gateways.guilds.schema.wordBlacklist.has('delete')) await this.client.gateways.guilds.schema.wordBlacklist.add('delete', { type: 'Boolean', array: false, default: false });
		if (!this.client.gateways.guilds.schema.wordBlacklist.has('words')) await this.client.gateways.guilds.schema.wordBlacklist.add('words', { type: 'String', array: true });
		return;
	}

};
