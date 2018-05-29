const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			enabled: true,
			once: false
		});
	}

	async run(guildMember) {
		if (guildMember.guild.available && guildMember.guild.configs.welcome.welcomeNewUsers) await this.welcome(guildMember);
		if (guildMember.guild.available && guildMember.guild.configs.logs.guildMemberAdd) await this.newMemberLog(guildMember);

		return;
	}

	async newMemberLog(guildMember) {
		const embed = new MessageEmbed()
			.setAuthor(`${guildMember.user.tag} - (${guildMember.id})`, guildMember.user.avatarURL())
			.setColor(this.client.configs.colors.green)
			.setTimestamp()
			.setFooter(guildMember.guild.language.get('GUILD_LOG_GUILDMEMBERADD'));

		const logChannel = await this.client.channels.get(guildMember.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async welcome(guildMember) {
		if (!guildMember.guild.configs.goodbye.welcomeMessage) return;
		// TODO: Parse welcome messages
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('guildMemberAdd')) await this.client.gateways.guilds.schema.logs.add('guildMemberAdd', { type: 'Boolean', array: false, default: false });

		if (!this.client.gateways.guilds.schema.has('welcome')) await this.client.gateways.guilds.schema.add('welcome');
		if (!this.client.gateways.guilds.schema.welcome.has('welcomeNewUsers')) await this.client.gateways.guilds.schema.welcome.add('welcomeNewUsers', { type: 'Boolean', array: false, default: false });
		if (!this.client.gateways.guilds.schema.welcome.has('welcomeMessage')) await this.client.gateways.guilds.schema.welcome.add('welcomeMessage', { type: 'String', array: false });
		if (!this.client.gateways.guilds.schema.welcome.has('welcomeChannel')) await this.client.gateways.guilds.schema.welcome.add('welcomeChannel', { type: 'TextChannel', array: false });
		return;
	}

};
