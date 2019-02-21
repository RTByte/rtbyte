const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['k'],
			permissionLevel: 5,
			requiredPermissions: ['KICK_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_KICK_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_KICK_NO_KICK_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_KICK_NO_KICK_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_KICK_NO_PERMS', user));

		reason = reason.join(' ');

		const member = await msg.guild.members.fetch(user);
		await member.kick(reason);

		if (msg.guild.settings.logs.events.guildMemberKick) await this.kickLog(member, reason);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async kickLog(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERKICK'));

		const logChannel = await this.client.channels.get(member.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
