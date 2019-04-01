const { MessageEmbed } = require('discord.js');
const { Util } = require('../../index');

class ModEmbed extends MessageEmbed {

	constructor(modCase) {
		super();
		this.modCase = modCase;
		this.client = modCase.client;
	}

	// eslint-disable-next-line complexity
	async build() {
		this.setAuthor(this.modCase.guild.language.get(`MODERATION_LOG_${this.modCase.type.toUpperCase()}`));
		if (this.modCase.user.id !== this.client.user.id) this.setTitle(`${this.modCase.user.tag} (${this.modCase.user.id})`);
		this.setDescription(this.modCase.guild.language.get('MODERATION_LOG_CASEID', this.modCase.id));
		this.setThumbnail(this.modCase.user.displayAvatarURL());
		/* eslint-disable indent */
			this.setColor(
				this.modCase.type === 'ban' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'unban' ? this.modCase.client.settings.colors.yellow :
				this.modCase.type === 'kick' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'mute' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'unmute' ? this.modCase.client.settings.colors.yellow :
				this.modCase.type === 'purge' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'softban' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'vcban' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'vcunban' ? this.modCase.client.settings.colors.yellow :
				this.modCase.type === 'vckick' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'antiInvite' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'mentionSpam' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'blacklistedWord' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'blacklistedName' ? this.modCase.client.settings.colors.red :
				this.modCase.type === 'warn' ? this.modCase.client.settings.colors.yellow :
				this.modCase.client.settings.colors.blue);
			/* eslint-enable indent */
		this.setTimestamp(this.modCase.timestamp);
		this.setFooter(this.modCase.guild.language.get('MODERATION_LOG_EVENTLOGGED'), this.modCase.client.user.displayAvatarURL());

		// Fields for all
		this.addField(this.modCase.guild.language.get('MODERATION_LOG_MODERATOR'), this.modCase.moderator ? this.modCase.moderator : this.modCase.guild.language.get('MODERATION_LOG_UNSPECIFIED'), true);
		this.addField(this.modCase.guild.language.get('MODERATION_LOG_REASON'), this.modCase.reason ? this.modCase.reason : this.modCase.guild.language.get('MODERATION_LOG_UNSPECIFIED'), true);

		// Type-specific fields
		if (this.modCase.channel) this.addField(this.modCase.guild.language.get('MODERATION_LOG_CHANNEL'), this.modCase.channel);
		if (this.modCase.duration) this.addField(this.modCase.guild.language.get('MODERATION_LOG_DURATION'), this.modCase.guild.language.get('MODERATION_LOG_DURATIONEND', this.modCase.duration), true);
		if (this.modCase.deletedMessageCount) this.addField(this.modCase.guild.language.get('MODERATION_LOG_DELETEDMESSAGECOUNT'), this.modCase.deletedMessageCount, true);
		if (this.modCase.messageContent) await Util.embedSplitter(this.modCase.guild.language.get('MODERATION_LOG_DELETEDMESSAGECONTENT'), this.modCase.messageContent.split(' '), this);
		if (this.modCase.badNickname) this.addField(this.modCase.guild.language.get('MODERATION_LOG_BADNICKNAME'), this.modCase.badNickname, true);

		// Optional (for all) fields
		if (this.modCase.link) this.addField(this.modCase.guild.language.get('MODERATION_LOG_LINK', this.modCase.link), this.modCase.guild.language.get('MODERATION_LOG_LINK', this.modCase.link), true);
		if (this.modCase.silent) this.addField(this.modCase.guild.language.get('MODERATION_LOG_SILENT'), this.modCase.silent ? 'true' : 'false', true);

		return this;
	}

	async send() {
		if (this.modCase.guild.settings.logs.moderation[this.modCase.type]) {
			const logChannel = this.modCase.guild.channels.get(this.modCase.guild.settings.channels.log);
			await logChannel.send('', { disableEveryone: true, embed: this });
		}
		// eslint-disable-next-line max-len
		if (this.modCase.guild.settings.moderation.notifyUser && !this.modCase.silent && this.client.users.has(this.modCase.user.id) && this.modCase.user.id !== this.client.user.id) await this.modCase.user.send(this.modCase.guild.language.get('COMMAND_MODERATION_BOILERPLATE', this.modCase.guild), { disableEveryone: true, embed: this });
		return;
	}

}

module.exports = ModEmbed;
