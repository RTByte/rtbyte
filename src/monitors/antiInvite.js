const { Monitor } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreSelf: true,
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild.settings.filters.antiInviteEnabled || !msg.guild.settings.filters.inviteWhitelist.length) return;
		if (msg.guild.settings.filters.modBypass && msg.member.roles.has(msg.guild.settings.roles.moderator)) return;
		const words = msg.content.split(' ');
		const inviteWhitelist = msg.guild.settings.filters.inviteWhitelist;

		if (!await this.cycleWords(words, inviteWhitelist, msg)) return;

		if (msg.guild.settings.logs.events.antiInvite) await this.antiInviteLog(msg);
		if (msg.guild.settings.filters.warn) await this.warnUser(msg);
		if (msg.guild.settings.filters.delete) await msg.delete();
		return;
	}

	async cycleWords(words, inviteWhitelist) {
		let whitelistedInvite = false;
        let hasInvite = false;
        const inviteREG = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g;

        for (let i = 0; i < words.length; i++) {
            if (words[i].match(inviteREG)) hasInvite = true;
            if (hasInvite) {
                for (let j = 0; j < inviteWhitelist.length; j++) {
                    if(words[i].match(inviteWhitelist[j])) {
                        return whitelistedInvite = false;
                    }
                whitelistedInvite = true;
                }
            }
        }
        return whitelistedInvite;
	}

	async warnUser(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.avatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(msg.guild.language.get('GUILD_LOG_REASON'), msg.guild.language.get('GUILD_LOG_ANTIINVITE', msg.channel))
			.setFooter(msg.guild.language.get('GUILD_LOG_GUILDMEMBERWARN'));

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		await msg.author.send(msg.guild.language.get('MONITOR_MODERATION_AUTO_BOILERPLATE', msg.guild), { disableEveryone: true, embed: embed });
		return;
	}

	async antiInviteLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.avatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField('Message', msg.content)
			.setFooter(msg.guild.language.get('GUILD_LOG_ANTIINVITE', msg.channel));

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};