const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const alternateNames = [
	'Not having any of this',
	'Embodiment of Rock \'n Roll',
	'Not happening',
	'Nope.',
	'Try again, bud',
	'Nice try',
	'Bad person',
	'I neva freeze',
	'enjincoin the minecraft crypto',
	'big mood'
];

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(oldMember, member) {
		if (member.guild.available && member.guild.configs.logs.memberUpdate) await this.memberUpdateLog(oldMember, member);
		if (member.guild.configs.wordBlacklist.checkDisplayNames) await this.autoSelener(member);
		return;
	}

	async memberUpdateLog(oldMember, member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.displayName} (${member.user.tag}) `, member.guild.iconURL())
			.setColor(this.client.configs.colors.blurple)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_MEMBERUPDATE'));

		if (oldMember.displayName !== member.displayName) embed.addField(member.guild.language.get('GUILD_LOG_MEMBERUPDATE_DISPLAYNAME'), `${oldMember.name} ➡️ ${member.name}`);

		const logChannel = await this.client.channels.get(member.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async autoSelener(member) {
		const words = member.displayName.split(' ');

		const wordBlacklist = this.client.monitors.get('wordBlacklist');
		if (!await wordBlacklist.cycleWords(words, member.guild.configs.wordBlacklist.words)) return;

		const oldName = member.displayName;
		await member.setNickname(alternateNames[`${Math.floor(Math.random() * alternateNames.length)}`]);

		if (member.guild.configs.logs.blacklistedNickname) await this.autoSelenerLog(oldName, member);
		if (member.guild.configs.wordBlacklist.warn) await this.warnUser(member);
		return;
	}

	async autoSelenerLog(oldName, member) {
		const newMember = await member.guild.members.get(member.id);
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.user.id})`, member.user.avatarURL())
			.setColor(this.client.configs.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('DISPLAY_NAME'), `${oldName} ➡️ ${newMember.displayName}`)
			.setFooter(member.guild.language.get('GUILD_LOG_AUTOSELENER'));

		const logChannel = await this.client.channels.get(member.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async warnUser(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.user.id})`, member.user.avatarURL())
			.setColor(this.client.configs.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), member.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', 'Nickname'))
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));

		const logChannel = await this.client.channels.get(member.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		await member.user.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async blacklistedWordLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} - (${msg.author.id})`, msg.author.avatarURL())
			.setColor(this.client.configs.colors.red)
			.setTimestamp()
			.addField('Message:', msg.content)
			.setFooter(msg.guild.language.get('GUILD_LOG_BLACKLISTEDWORD', msg.channel));

		const logChannel = await this.client.channels.get(msg.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('memberUpdate')) await this.client.gateways.guilds.schema.logs.add('memberUpdate', { type: 'Boolean', array: false, default: true });
		if (!this.client.gateways.guilds.schema.logs.has('blacklistedNickname')) await this.client.gateways.guilds.schema.logs.add('blacklistedNickname', { type: 'Boolean', array: false, default: true });
		if (!this.client.gateways.guilds.schema.has('wordBlacklist')) await this.client.gateways.guilds.schema.add('wordBlacklist');
		if (!this.client.gateways.guilds.schema.wordBlacklist.has('checkDisplayNames')) await this.client.gateways.guilds.schema.wordBlacklist.add('checkDisplayNames', { type: 'Boolean', array: false, default: false }); // eslint-disable-line max-len
		return;
	}

};
