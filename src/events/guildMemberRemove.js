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
		if (guildMember.guild.available && guildMember.guild.configs.goodbye.dismissUsers) await this.dismiss(guildMember);
		if (guildMember.guild.available && guildMember.guild.configs.logs.guildMemberRemove) await this.leaveLog(guildMember);

		return;
	}

	async leaveLog(guildMember) {
		const embed = new MessageEmbed()
			.setAuthor(`${guildMember.user.tag} - (${guildMember.id})`, guildMember.user.avatarURL())
			.setColor('#ff9b9b')
			.setTimestamp()
			.setFooter(guildMember.guild.language.get('GUILD_LOG_GUILDMEMBERREMOVE'));

		const logChannel = await this.client.channels.get(guildMember.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async dismiss(guildMember) {
		if (!guildMember.guild.configs.goodbye.leaveMessage) return;
		// TODO: Parse goodbye messages
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('guildMemberRemove')) await this.client.gateways.guilds.schema.logs.add('guildMemberRemove', { type: 'Boolean', array: false, default: false });
		if (!this.client.gateways.guilds.schema.has('goodbye')) await this.client.gateways.guilds.schema.add('goodbye');
		if (!this.client.gateways.guilds.schema.goodbye.has('dismissUsers')) await this.client.gateways.guilds.schema.goodbye.add('dismissUsers', { type: 'Boolean', array: false, default: false });
		if (!this.client.gateways.guilds.schema.goodbye.has('leaveMessage')) await this.client.gateways.guilds.schema.goodbye.add('leaveMessage', { type: 'String', array: false });
		if (!this.client.gateways.guilds.schema.goodbye.has('leaveMessageChannel')) await this.client.gateways.guilds.schema.goodbye.add('leaveMessageChannel', { type: 'TextChannel', array: false });
		return;
	}

};
