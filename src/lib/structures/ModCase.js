const { KlasaUser, KlasaGuild } = require('klasa');
const { TextChannel } = require('discord.js');
const ModEmbed = require('./ModEmbed');

module.exports = class Case {

	constructor(guild) {
		if (!(guild instanceof KlasaGuild)) throw 'Case requires a valid KlasaGuild!';
		// Automatic variables
		this.client = guild.client;
		this.guild = guild;
		this.timestamp = Date.now();
		this.id = null;
		this.submitted = null;
		// Required variables
		this.user = null;
		this.type = null;
		// Updateable variables
		this.moderator = null;
		this.reason = null;
		// Optional variables
		this.channel = null;
		this.silent = null;
		this.duration = null;
		this.deletedMessageCount = null;
		this.messageContent = null;
		this.badNickname = null;
		this.link = null;
	}

	// Setters

	setUser(user) {
		if (this.submitted) throw 'user cannot be changed once submitted!';
		if (!(user instanceof KlasaUser)) throw 'Case#setUser requires a valid KlasaUser!';
		this.user = user;
		return this;
	}

	setModerator(user) {
		if (!(user instanceof KlasaUser)) throw 'Case#setModerator requires a valid KlasaUser!';
		if (!this.guild.members.cache.has(user.id)) throw `${user.id} is not a member of ${this.guild.name}!`;
		this.moderator = user;
		return this;
	}

	setType(type) {
		if (this.submitted) throw 'type cannot be changed once submitted!';
		switch (type) {
			case 'ban':
			case 'unban':
			case 'kick':
			case 'mute':
			case 'unmute':
			case 'purge':
			case 'softban':
			case 'vcban':
			case 'vcunban':
			case 'vckick':
			case 'antiInvite':
			case 'mentionSpam':
			case 'blacklistedWord':
			case 'blacklistedNickname':
			case 'warn': this.type = type; break;
			default: throw `${type} is not a valid Case type!`;
		}
		return this;
	}

	setReason(reason) {
		this.reason = reason;
		return this;
	}

	setSilent(silent = true) {
		if (this.submitted) throw 'silent flag cannot be changed once submitted!';
		if (silent) this.silent = true;
		return this;
	}

	setDuration(when) {
		if (this.submitted) throw 'duration cannot be changed once submitted!';
		this.duration = when;
		return this;
	}

	setDeletedMessageCount(deletedMessageCount = null) {
		if (this.submitted) throw 'deletedMessageCount cannot be changed once submitted!';
		this.deletedMessageCount = deletedMessageCount;
		return this;
	}

	setMessageContent(messageContent = null) {
		if (this.submitted) throw 'messageContent cannot be changed once submitted!';
		this.messageContent = messageContent;
		return this;
	}

	setBadNickname(badNickname = null) {
		if (this.submitted) throw 'badNickname cannot be changed once submitted!';
		this.badNickname = badNickname;
		return this;
	}

	setLink(link = null) {
		if (this.submitted) throw 'link cannot be changed once submitted!';
		this.link = link;
		return this;
	}

	setChannel(channel = null) {
		if (this.submitted) throw 'channel cannot be changed once submitted!';
		if (!(channel instanceof TextChannel)) throw 'Case#setChannel requires a valid TextChannel!';
		this.channel = channel;
		return this;
	}

	// Finalizer

	async submit() {
		if (this.submitted) throw 'Cases cannot be re-submitted!';
		if (!this.user || !this.type) throw 'Case Requires at least a User and a Type to be set!';
		this.id = await this._getID();
		this.submitted = true;

		await this.client.settings.update('moderation.cases', await this.pack(), this.guild);

		return this;
	}

	async delete() {
		if (!this.submitted) throw 'Cases cannot be deleted unless submitted first!';

		await this.client.settings.destroy('moderation.cases', this, this.guild);

		return this;
	}

	async pack() {
		const pack = {};
		pack.id = this.id ? this.id : null;
		pack.guild = this.guild ? this.guild.id : null;
		pack.timestamp = this.timestamp ? this.timestamp : null;
		pack.submitted = this.submitted ? this.submitted : null;
		pack.user = this.user ? this.user.id : null;
		pack.type = this.type ? this.type : null;
		pack.moderator = this.moderator ? this.moderator.id : null;
		pack.reason = this.reason ? this.reason : null;
		pack.silent = this.silent ? this.silent : null;
		pack.duration = this.duration ? this.duration : null;
		pack.deletedMessageCount = this.deletedMessageCount ? this.deletedMessageCount : null;
		pack.messageContent = this.messageContent ? this.messageContent : null;
		pack.badNickname = this.badNickname ? this.badNickname : null;
		pack.link = this.link ? this.link : null;
		pack.channel = this.channel ? this.channel.id : null;
		return pack;
	}

	async unpack(pack) {
		this.id = pack.id ? pack.id : null;
		this.guild = pack.guild && this.client.guilds.cache.has(pack.guild) ? this.client.guilds.cache.get(pack.guild) : this.guild;
		this.timestamp = pack.timestamp ? pack.timestamp : null;
		this.submitted = pack.submitted ? pack.submitted : null;
		this.user = pack.user && this.client.users.cache.has(pack.user) ? this.client.users.cache.get(pack.user) : null;
		this.type = pack.type ? pack.type : null;
		this.moderator = pack.moderator && this.client.users.cache.has(pack.moderator) ? this.client.users.cache.get(pack.moderator) : null;
		this.reason = pack.reason ? pack.reason : null;
		this.silent = pack.silent ? pack.silent : null;
		this.duration = pack.duration ? pack.duration : null;
		this.deletedMessageCount = pack.deletedMessageCount ? pack.deletedMessageCount : null;
		this.messageContent = pack.messageContent ? pack.messageContent : null;
		this.badNickname = pack.badNickname ? pack.badNickname : null;
		this.link = pack.link ? pack.link : null;
		this.channel = pack.channel && this.client.channels.cache.has(pack.channel) ? this.client.channels.cache.get(pack.channel) : null;
		return this;
	}

	async embed() {
		const caseEmbed = new ModEmbed(this);
		return await caseEmbed.build();
	}

	// Internal Functions

	async _getID() {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		for (let i = 0; ; i++) {
			if (await this.client.settings.get('moderation.cases').find(obj => obj.id === `${this.type}_${this.timestamp}${i}`)) continue;
			return `${this.type}_${this.timestamp}${i}`;
		}
	}

};
