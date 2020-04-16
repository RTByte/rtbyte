const { Monitor } = require('klasa');
const { ModCase } = require('../index');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreSelf: true,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild) return;
		if (!msg.guild.settings.get('filters.antiInviteEnabled')) return;
		if (msg.guild.settings.get('filters.modBypass') && (msg.member.roles.has(msg.guild.settings.get('roles.moderator')) || msg.member.roles.has(msg.guild.settings.get('roles.administrator')))) return;
		const words = msg.content.split(' ');
		const inviteWhitelist = Object(msg.guild.settings.get('filters.inviteWhitelist'));

		if (!await this.cycleWords(words, inviteWhitelist, msg)) return;

		const modCase = new ModCase(msg.guild)
			.setUser(msg.author)
			.setType('antiInvite')
			.setModerator(this.client.user)
			.setReason(msg.guild.language.get('GUILD_LOG_ANTIINVITE', msg.channel))
			.setMessageContent(msg.content);
		await modCase.submit();

		const embed = await modCase.embed();
		await embed.send();

		if (msg.guild.settings.get('filters.delete')) await msg.delete();

		const punishment = msg.guild.settings.get('filters.antiInvitePunishment');
		if (punishment === 'mute') this.punishmentMute(msg);
		if (punishment === 'kick') this.punishmentKick(msg);
		if (punishment === 'softban') this.punishmentSoftban(msg);
		if (punishment === 'ban') this.punishmentBan(msg);

		return;
	}

	async cycleWords(words, inviteWhitelist, msg) {
		let whitelistedInvite = false;
		let hasInvite = false;
		const inviteREG = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g;

		for (let i = 0; i < words.length; i++) {
			if (words[i].match(inviteREG)) hasInvite = true;
			if (hasInvite) {
				if (!msg.guild.settings.get('filters.inviteWhitelist').length) {
					whitelistedInvite = true;
					return whitelistedInvite;
				}
				for (let j = 0; j < inviteWhitelist.length; j++) {
					if (words[i].match(inviteWhitelist[j])) {
						whitelistedInvite = false;
						return whitelistedInvite;
					}
					whitelistedInvite = true;
				}
			}
		}
		return whitelistedInvite;
	}

	async punishmentMute(msg) {
		if (!msg.member.canMod(msg.author)) return;
		const mute = this.client.commands.get('mute');
		if (!msg.guild.settings.get('roles.muted') || !msg.guild.roles.has(msg.guild.settings.get('roles.muted'))) await mute.createRole(msg.guild);
		if (msg.member.roles.has(msg.guild.settings.get('roles.muted'))) return;
		const mutedRole = await msg.guild.roles.get(msg.guild.settings.get('roles.muted'));
		await msg.member.roles.add(mutedRole);

		const modCase = new ModCase(msg.guild)
			.setUser(msg.author)
			.setType('mute')
			.setModerator(this.client.user);
		await modCase.submit();

		const modEmbed = await modCase.embed();
		await modEmbed.send();
	}

	async punishmentKick(msg) {
		if (!msg.member.canMod(msg.author)) return;
		await msg.member.kick();
	}

	async punishmentSoftban(msg) {
		if (!msg.member.canMod(msg.author)) return;
		await msg.guild.members.ban(msg.author, { days: 1 });
		await msg.guild.members.unban(msg.author.id, msg.language.get('COMMAND_SOFTBAN_SOFTBAN_RELEASED', msg.channel));
	}

	async punishmentBan(msg) {
		if (!msg.member.canMod(msg.author)) return;
		await msg.guild.members.ban(msg.author, { days: 1 });
	}

};
