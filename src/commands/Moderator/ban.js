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

		if (msg.guild.settings.moderation.notifyUser && !reason.includes('-s', reason.length - 2)) await this.notifyUser(member, reason);
		await msg.guild.members.ban(user, { days: 1, reason: reason });

		if (reason.includes('-s', reason.length - 2)) return msg.delete();

		return msg.affirm();
	}

	async notifyUser(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDBANADD'));
		await member.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}
};