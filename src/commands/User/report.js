const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['r'],
			permissionLevel: 0,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_REPORT_DESCRIPTION'),
			usage: '<member:member> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [member, ...reason]) {
		if (member.id === this.client.user.id) throw msg.language.get('COMMAND_REPORT_NO_REPORT_CLIENT');

		reason = reason.join(' ');

		if (msg.guild.configs.logs.report) await this.reportLog(member, reason, msg.member);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async reportLog(member, reason, reporter) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.avatarURL())
			.setColor('#ff0000')
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.addField(member.guild.language.get('GUILD_LOG_REPORT_REPORTER'), reporter)
			.setFooter(member.guild.language.get('GUILD_LOG_REPORT'));

		const logChannel = await this.client.channels.get(member.guild.configs.channels.serverLog);
		const adminRole = await member.guild.roles.get(member.guild.configs.roles.administrator);
		const modRole = await member.guild.roles.get(member.guild.configs.roles.moderator);
		await logChannel.send(`${adminRole} ${modRole}`, { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('report')) await this.client.gateways.guilds.schema.logs.add('report', { type: 'Boolean', array: false, default: true });
		return;
	}

};
