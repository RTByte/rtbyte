const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vb', 'vcb'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_VCBAN_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (!msg.guild.configs.roles.voiceBanned || !msg.guild.roles.has(msg.guild.configs.roles.voiceBanned)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) throw msg.language.get('COMMAND_VCBAN_NO_VCBAN_SELF');
		if (user.id === this.client.user.id) throw msg.language.get('COMMAND_VCBAN_NO_VCBAN_CLIENT');
		if (!msg.member.canMod(user)) throw msg.language.get('COMMAND_VCBAN_NO_PERMS', user);

		const vckick = await this.client.commands.get('vckick');
		await vckick.run(msg, [user, ...reason]);

		reason = reason.join(' ');

		const member = await msg.guild.members.fetch(user);
		if (member.roles.has(msg.guild.configs.roles.voiceBanned)) return msg.affirm();
		const voiceBannedRole = await msg.guild.roles.get(msg.guild.configs.roles.voiceBanned);
		await member.roles.add(voiceBannedRole);

		if (msg.guild.configs.logs.guildMemberVCBan) await this.vcbanLog(member, reason);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async vcbanLog(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.avatarURL())
			.setColor('#ff0000')
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERVCBAN'));

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
		if (!this.client.gateways.guilds.schema.roles.has('voiceBanned')) await this.client.gateways.guilds.schema.roles.add('voiceBanned', { type: 'Role', array: false });
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('guildMemberVCBan')) await this.client.gateways.guilds.schema.logs.add('guildMemberVCBan', { type: 'Boolean', array: false, default: true });
		return;
	}

	async createRole(guild) {
		const voiceBannedRole = await guild.roles.create({ data: { name: 'Voice Chat Banned' }, reason: `${this.client.user.username} initialization: Voice Chat Banned Role` });
		await guild.configs.update({ roles: { voiceBanned: voiceBannedRole } }, guild);

		await guild.channels.forEach(async (channel) => {
			if (channel.type === 'voice') {
				await channel.overwritePermissions({
					overwrites: [{ id: voiceBannedRole.id, denied: ['CONNECT', 'SPEAK'] }],
					reason: `${this.client.user.username} initialization: Denying voice channel permissions for Voice Chat Banned Role`
				});
			}
		});

		return;
	}

};
