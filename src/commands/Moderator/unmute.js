const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['um'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_UNMUTE_DESCRIPTION'),
			usage: '<member:user>',
			usageDelim: ' '
		});
	}

	async run(msg, [user]) {
		if (!msg.guild.settings.roles.muted || !msg.guild.roles.has(msg.guild.settings.roles.muted)) await this.createRole(msg.guild);

		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_UNMUTE_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_UNMUTE_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_UNMUTE_NO_PERMS', user));

		const member = await msg.guild.members.fetch(user);

		if (!member.roles.has(msg.guild.settings.roles.muted)) return msg.affirm();
		const mutedRole = await msg.guild.roles.get(msg.guild.settings.roles.muted);
		await member.roles.remove(mutedRole);

		if (msg.guild.settings.logs.events.guildMemberUnmute) await this.unmuteLog(member);

		await this.messageUser(msg, member);

		return msg.affirm();
	}

	async unmuteLog(member) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.yellow)
			.setTimestamp()
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERUNMUTE'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async createRole(guild) {
		const mute = await this.client.commands.get('mute');
		return mute.createRole(guild);
	}

	async messageUser(msg, member) {
		if (!msg.guild.settings.moderation.notifyUser) return;
		const embed = new MessageEmbed()
			.setAuthor(`${msg.guild} (${msg.guild.id})`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_GUILDMEMBERUNMUTE'));
		await member.send(msg.guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', msg.guild), { disableEveryone: true, embed: embed });
		return;
	}
};