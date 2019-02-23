const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['b'],
			permissionLevel: 5,
			requiredPermissions: ['BAN_MEMBERS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_BAN_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_BAN_NO_PERMS', user));

		reason = reason.join(' ');

		const member = await msg.guild.members.fetch(user);

		await this.messageUser(msg, member, reason);

		await msg.guild.members.ban(user, { days: 1, reason: reason });

		if (reason.includes('-s', reason.length - 2)) return msg.delete();

		return msg.affirm();
	}

	async messageUser(msg, member, reason) {
		if (!msg.guild.settings.moderation.notifyUser) return;
		const embed = new MessageEmbed()
			.setAuthor(`${msg.guild} (${msg.guild.id})`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(msg.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(msg.guild.language.get('GUILD_LOG_GUILDBANADD'));
		await member.send(msg.guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', msg.guild), { disableEveryone: true, embed: embed });
		return;
	}
};