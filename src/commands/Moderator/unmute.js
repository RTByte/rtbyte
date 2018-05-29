const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['um'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_UNMUTE_DESCRIPTION'),
			usage: '<member:user>',
			usageDelim: ' '
		});
	}

	async run(msg, [user]) {
		if (!msg.guild.configs.roles.muted || !msg.guild.roles.has(msg.guild.configs.roles.muted)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_UNMUTE_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_UNMUTE_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_PERMS', user));

		const member = await msg.guild.members.fetch(user);
		if (!member.roles.has(msg.guild.configs.roles.muted)) return msg.affirm();
		const mutedRole = await msg.guild.roles.get(msg.guild.configs.roles.muted);
		await member.roles.remove(mutedRole);

		if (msg.guild.configs.logs.guildMemberMute) await this.unmuteLog(member);

		return msg.affirm();
	}

	async unmuteLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.avatarURL())
			.setColor(this.client.configs.colors.yellow)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERUNMUTE'));

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
		if (!this.client.gateways.guilds.schema.logs.has('guildMemberUnmute')) await this.client.gateways.guilds.schema.logs.add('guildMemberUnmute', { type: 'Boolean', array: false, default: true });
		return;
	}

	async createRole(guild) {
		const mute = await this.client.commands.get('mute');
		return mute.createRole(guild);
	}

};
