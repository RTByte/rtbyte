const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vk', 'vck'],
			permissionLevel: 5,
			requiredPermissions: ['MANAGE_CHANNELS', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_VCKICK_DESCRIPTION'),
			usage: '<member:user> <reason:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [user, ...reason]) {
		if (user.id === msg.author.id) return msg.reject(msg.language.get('COMMAND_VCKICK_NO_VCKICK_SELF'));
		if (user.id === this.client.user.id) return msg.reject(msg.language.get('COMMAND_VCKICK_NO_VCKICK_CLIENT'));
		if (!await msg.member.canMod(user)) return msg.reject(msg.language.get('COMMAND_VCKICK_NO_PERMS', user));

		reason = reason.join(' ');

		const member = await msg.guild.members.fetch(user);

		if (!member.voiceChannel) return msg.affirm();

		const tempVC = await msg.guild.channels.create(member.id, { type: 'voice', userLimit: 1, reason: `Temporary Channel to kick ${member.user.tag} from voice chat.` });
		await member.setVoiceChannel(tempVC);
		await setTimeout(() => tempVC.delete(`Deleting Channel to kick ${member.user.tag} from voice chat.`), 250);

		if (msg.guild.configs.logs.guildMemberVCKick) await this.vckickLog(member, reason);

		if (reason.includes('-s', reason.length - 2)) return msg.delete({ reason: msg.language.get('COMMAND_MODERATION_SILENT') });

		return msg.affirm();
	}

	async vckickLog(member, reason) {
		const embed = new MessageEmbed()
			.setAuthor(`${member.user.tag} - (${member.id})`, member.user.avatarURL())
			.setColor(this.client.configs.colors.red)
			.setTimestamp()
			.addField(member.guild.language.get('GUILD_LOG_REASON'), reason)
			.setFooter(member.guild.language.get('GUILD_LOG_GUILDMEMBERVCKICK'));

		const logChannel = await this.client.channels.get(member.guild.configs.channels.serverLog);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

	async init() {
		await this.ensureGuildVars();
		return;
	}

	async ensureGuildVars() {
		if (!this.client.gateways.guilds.schema.has('logs')) await this.client.gateways.guilds.schema.add('logs');
		if (!this.client.gateways.guilds.schema.logs.has('guildMemberVCKick')) await this.client.gateways.guilds.schema.logs.add('guildMemberVCKick', { type: 'Boolean', array: false, default: true });
		return;
	}

};
