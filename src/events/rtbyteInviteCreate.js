const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { momentThreshold, timezone } = require('../lib/util/util');
const moment = require('moment-timezone');

momentThreshold(moment);

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'inviteCreate' });
	}

	async run(invite) {
		if (!invite.guild) return;

		if (invite.guild.settings.get('channels.log') && invite.guild.settings.get('logs.events.inviteCreate')) await this.serverLog(invite);

		return;
	}

	async serverLog(invite) {
		const affirmEmoji = this.client.emojis.cache.get(this.client.settings.get('emoji.affirm'));

		const embed = new MessageEmbed()
			.setAuthor(`discord.gg/${invite.code}`, invite.guild.iconURL())
			.setDescription(invite.url)
			.setColor(this.client.settings.get('colors.green'))
			.addField(invite.channel.type === 'text' ? invite.guild.language.get('CHANNEL') : invite.guild.language.get('VOICE_CHANNEL'),
				invite.channel.type === 'text' ? invite.channel : `${invite.channel.name}`, true)
			.setTimestamp()
			.setFooter(invite.guild.language.get('GUILD_LOG_INVITECREATE', invite.inviter), invite.inviter.displayAvatarURL());

		if (invite.maxAge) {
			embed.addField(invite.guild.language.get('GUILD_LOG_INVITECREATE_EXPIRY'), timezone(invite.expiresTimestamp, invite.guild), true);
		}

		if (invite.maxUses) {
			embed.addField(invite.guild.language.get('GUILD_LOG_INVITECREATE_MAXUSES'), invite.maxUses, true);
		}

		if (invite.temporary) {
			embed.addField(invite.guild.language.get('GUILD_LOG_INVITECREATE_TEMPORARY'), affirmEmoji, true);
		}

		const logChannel = await this.client.channels.cache.get(invite.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { embed: embed });

		return;
	}

};
