const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vub', 'vcub'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_VCUNBAN_DESCRIPTION'),
			usage: '<member:user>',
			usageDelim: ' '
		});
	}

	async run(msg, [user]) {
		if (!msg.guild.settings.roles.voiceBanned || !msg.guild.roles.has(msg.guild.settings.roles.voiceBanned)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_VCUNBAN_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_VCUNBAN_NO_PERMS', user));

		const member = await msg.guild.members.fetch(user);
		if (!member.roles.has(msg.guild.settings.roles.voiceBanned)) return msg.affirm();
		const voiceBannedRole = await msg.guild.roles.get(msg.guild.settings.roles.voiceBanned);
		await member.roles.remove(voiceBannedRole);

		if (msg.guild.settings.logs.guildMemberVCBanRemove) await this.vcunbanLog(member);

		return msg.affirm();
	}

	async vcunbanLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.yellow)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERVCUNBAN'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		if (member.guild.settings.moderation.notifyUser) await member.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async createRole(guild) {
		const vcban = await this.client.commands.get('vcban');
		return vcban.createRole(guild);
	}

};
