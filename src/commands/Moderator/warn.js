const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['w'],
			permissionLevel: 5,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_WARN_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_WARN_NO_WARN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_WARN_NO_WARN_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_WARN_NO_PERMS', user));

		reason = reason.join(' ');

		const member = await msg.guild.members.fetch(user);

		await this.messageUser(msg, member, reason);

		if (msg.guild.settings.logs.events.guildMemberWarn) await this.warnLog(member, reason);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async warnLog(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		await member.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async messageUser(msg, member, reason) {
		if (!msg.guild.settings.moderation.notifyUser) return;
		const embed = new MessageEmbed()
			.setAuthor(`${msg.guild} (${msg.guild.id})`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(msg.guild.language.get('GUILD_LOG_WARNING'), reason)
			.setFooter(msg.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));
		await member.send(msg.guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', msg.guild), { disableEveryone: true, embed: embed });
		return;
	}

};
