const { MessageEmbed } = require('discord.js');
const { Colors } = require('../util/constants');
const { embedSplitter } = require('../util/util');

class ModEmbed extends MessageEmbed {

	constructor(modCase) {
		super();
		this.modCase = modCase;
		this.client = modCase.client;
	}

	// eslint-disable-next-line complexity
	async build() {
		this.setAuthor(this.modCase.guild.language.get(`MODERATION_LOG_${this.modCase.type.toUpperCase()}`));
		if (this.modCase.user && this.modCase.user.id !== this.client.user.id) this.setTitle(`${this.modCase.user.tag} (${this.modCase.user.id})`);
		if (!this.modCase.user) this.setTitle(this.modCase.guild.language.get('UNFETCHABLE_USER'));
		this.setDescription(this.modCase.guild.language.get('MODERATION_LOG_CASEID', this.modCase.id));
		if (this.modCase.user) this.setThumbnail(this.modCase.user.displayAvatarURL());
		/* eslint-disable indent */
			this.setColor(
				this.modCase.type === 'ban' ? Colors.red :
				this.modCase.type === 'unban' ? Colors.yellow :
				this.modCase.type === 'kick' ? Colors.red :
				this.modCase.type === 'mute' ? Colors.red :
				this.modCase.type === 'unmute' ? Colors.yellow :
				this.modCase.type === 'purge' ? Colors.red :
				this.modCase.type === 'softban' ? Colors.red :
				this.modCase.type === 'vcban' ? Colors.red :
				this.modCase.type === 'vcunban' ? Colors.yellow :
				this.modCase.type === 'vckick' ? Colors.red :
				this.modCase.type === 'antiInvite' ? Colors.red :
				this.modCase.type === 'mentionSpam' ? Colors.red :
				this.modCase.type === 'blacklistedWord' ? Colors.red :
				this.modCase.type === 'blacklistedNickname' ? Colors.red :
				this.modCase.type === 'warn' ? Colors.yellow :
				Colors.blue);
			/* eslint-enable indent */
		this.setTimestamp(this.modCase.timestamp);
		this.setFooter(this.modCase.guild.language.get('MODERATION_LOG_EVENTLOGGED'), this.modCase.client.user.displayAvatarURL());

		// Fields for all
		this.addField(this.modCase.guild.language.get('MODERATION_LOG_MODERATOR'), this.modCase.moderator ? this.modCase.moderator : this.modCase.guild.language.get('MODERATION_LOG_UNSPECIFIED'), true);
		this.addField(this.modCase.guild.language.get('REASON'), this.modCase.reason ? this.modCase.reason : this.modCase.guild.language.get('MODERATION_LOG_UNSPECIFIED'), true);

		// Type-specific fields
		if (this.modCase.channel) this.addField(this.modCase.guild.language.get('CHANNEL'), this.modCase.channel);
		if (this.modCase.duration) this.addField(this.modCase.guild.language.get('MODERATION_LOG_DURATION'), this.modCase.guild.language.get('MODERATION_LOG_DURATIONEND', this.modCase.duration), true);
		if (this.modCase.deletedMessageCount) this.addField(this.modCase.guild.language.get('MODERATION_LOG_DELETEDMESSAGECOUNT'), this.modCase.deletedMessageCount, true);
		if (this.modCase.messageContent) await embedSplitter(this.modCase.guild.language.get('MODERATION_LOG_DELETEDMESSAGECONTENT'), this.modCase.messageContent.split(' '), this);
		if (this.modCase.badNickname) this.addField(this.modCase.guild.language.get('MODERATION_LOG_BADNICKNAME'), this.modCase.badNickname, true);

		// Optional (for all) fields
		if (this.modCase.link) this.addField(this.modCase.guild.language.get('MODERATION_LOG_LINK', this.modCase.link), this.modCase.guild.language.get('MODERATION_LOG_LINK', this.modCase.link), true);
		if (this.modCase.silent) this.addField(this.modCase.guild.language.get('MODERATION_LOG_SILENT'), this.modCase.silent ? 'true' : 'false', true);

		return this;
	}

	async send() {
		if (this.modCase.guild.settings.get(`logs.moderation.${[this.modCase.type]}`)) {
			const logChannel = this.modCase.guild.channels.cache.get(this.modCase.guild.settings.get('channels.log'));
			if (logChannel) await logChannel.send('', { embed: this });
		}

		if (!this.modCase.guild.settings.get('moderation.notifyUser')) return null;
		if (this.modCase.type === 'unban') return null;
		if (this.modCase.silent) return null;
		if (!this.client.users.cache.has(this.modCase.user.id)) return null;
		if (this.modCase.user.id === this.client.user.id) return null;
		if (this.modCase.user.bot || this.modCase.user.system) return null;
		this.modCase.user.createDM().then((dm) => dm.send(this.modCase.moderator ? this.modCase.moderator.id === this.client.user.id ?
			this.modCase.guild.language.get('MODERATION_LOG_BOILERPLATE_AUTO', this.modCase.guild) :
			this.modCase.guild.language.get('MODERATION_LOG_BOILERPLATE', this.modCase.guild) : '', { embed: this }).catch((err) => err));

		return true;
	}

}

module.exports = ModEmbed;
