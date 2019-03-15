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
			usage: '<member:user> [when:time] <reason:...string>',
			usageDelim: ' '
		});
	}

	async run(msg, [user, when, ...reason]) {
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_BAN_NO_BAN_CLIENT'));
		if (!msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_BAN_NO_PERMS', user));

		const member = await msg.guild.members.fetch(user);

		if (msg.guild.settings.moderation.notifyUser && !reason.includes('-s', reason.length - 2)) await this.notifyUser(member, when, reason);
		await msg.guild.members.ban(user, { days: 1, reason: when ? `${msg.language.get('GUILD_LOG_GUILDBANADD_TIMED', when)} | ${reason}` : reason });

		if (when) {
			await this.client.schedule.create('timedBan', when, {
				data: {
					guildID: msg.guild.id,
					userID: user.id,
					userTag: user.tag
				}
			});
		}

		if (reason.includes('-s', reason.length - 2)) return msg.delete();

		return msg.affirm();
	}

	async notifyUser(member, when, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(when ? member.guild.language.get('GUILD_LOG_GUILDBANADD_TIMED', when) : member.guild.language.get('GUILD_LOG_GUILDBANADD'));

		await member.send(member.guild.language.get('COMMAND_MODERATION_BOILERPLATE', member.guild), { disableEveryone: true, embed: embed });
		return;
	}

};
