const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vub', 'vcub'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_VCUNBAN_DESCRIPTION'),
			usage: '<member:user>',
			usageDelim: ' '
		});
	}

	async run(msg, [user]) {
		if (!msg.guild.configs.roles.voiceBanned || !msg.guild.roles.has(msg.guild.configs.roles.voiceBanned)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_PERMS', user));

		const member = await msg.guild.members.fetch(user);
		if (!member.roles.has(msg.guild.configs.roles.voiceBanned)) return msg.affirm();
		const voiceBannedRole = await msg.guild.roles.get(msg.guild.configs.roles.voiceBanned);
		await member.roles.remove(voiceBannedRole);

		if (msg.guild.configs.logs.guildMemberMute) await this.vcunbanLog(member);

		return msg.affirm();
	}

	async vcunbanLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.avatarURL())
			.setColor('#60fe60')
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERVCUNBAN'));

		const logChannel = await this.client.channels.get(member.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('roles')) await this.client.gateways.guilds.schema.add('roles');
		if (!this.client.gateways.guilds.schema.roles.has('muted')) await this.client.gateways.guilds.schema.roles.add('muted', { type: 'Role', array: false });
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('guildMemberVCUnban')) await this.client.gateways.guilds.schema.logs.add('guildMemberVCUnban', { type: 'Boolean', array: false, default: true });
		return;
	}

	async createRole(guild) {
		const vcban = await this.client.commands.get('vcban');
		return vcban.createRole(guild);
	}

};
