const { KlasaUser, KlasaGuild } = require('klasa');

module.exports = class Case {

	constructor(guild) {
		if (!(guild instanceof KlasaGuild)) throw 'Case requires a valid Guild!';
		// Automatic variables
		this.client = guild.client;
		this.guild = guild;
		this.timestamp = Date.now();
		this.id = null;
		this.submitted = true;
		// Required variables
		this.user = null;
		this.type = null;
		// Optional variables
		this.moderator = null;
		this.reason = null;
		this.silent = null;
		this.duration = null;
		this.deletedMessageCount = null;
		this.messageContent = null;
		this.badNickname = null;
	}

	// Setters

	setUser(user) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (!(user instanceof KlasaUser)) throw 'Case#setUser requires a valid KlasaUser!';
		if (!this.guild.members.has(user)) throw `${user.id} is not a member of ${this.guild.name}!`;
		this.user = user.id;
		return this;
	}

	setModerator(user) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (!(user instanceof KlasaUser)) throw 'Case#setModerator requires a valid KlasaUser!';
		if (!this.guild.members.has(user)) throw `${user.id} is not a member of ${this.guild.name}!`;
		this.moderator = user.id;
		return this;
	}

	setType(type) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (!(type instanceof String)) throw 'Case#setType requires a valid String!';
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
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (!(reason instanceof String)) throw 'Case#setReason requires a valid String!';
		this.reason = reason;
		return this;
	}

	setSilent(silent = true) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (silent) this.silent = true;
		return this;
	}

	setDuration(endTimestamp = null) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		this.duration = parseInt(endTimestamp);
		return this;
	}

	setDeletedMessageCount(deletedMessageCount = null) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		this.deletedMessageCount = deletedMessageCount;
		return this;
	}

	setMessageContent(messageContent = null) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (!(messageContent instanceof String)) throw 'Case#setMessageContent requires a valid String!';
		this.messageContent = messageContent;
		return this;
	}

	setBadNickname(badNickname = null) {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (!(badNickname instanceof String)) throw 'Case#setBadNickname requires a valid String!';
		this.badNickname = badNickname;
		return this;
	}

	// Finalizer

	async submit() {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		if (!this.user || !this.type) throw 'Case Requires at least a User and a Type to be set!';
		this.id = await this._getID();
		this.submitted = true;

		const member = this.guild.members.get(this.user);
		const pack = await this._getPack();

		await this.client.settings.update('moderation.cases', pack, this.guild);
		await member.settings.update('moderation.cases', pack.id, this.guild);

		return this;
	}

	async delete() {
		if (!this.submitted) throw 'Cases cannot be deleted unless submitted first!';

		const member = this.guild.members.get(this.user);
		const pack = await this._getPack();

		await this.client.settings.update('moderation.cases', pack, this.guild);
		await member.settings.update('moderation.cases', pack.id, this.guild);

		return this;
	}

	async unpack(pack) {
		this.id = pack.id ? pack.id : null;
		this.guild = pack.guild ? await this.client.guilds.get(pack.guild) : null;
		this.timestamp = pack.timestamp ? pack.timestamp : null;
		this.submitted = pack.submitted ? pack.submitted : null;
		this.user = pack.user ? await this.client.users.get(pack.user) : null;
		this.type = pack.type ? pack.type : null;
		this.moderator = pack.moderator ? await this.client.users.get(pack.moderator) : null;
		this.reason = pack.reason ? pack.reason : null;
		this.silent = pack.silent ? pack.silent : null;
		this.duration = pack.duration ? pack.duration : null;
		this.deletedMessageCount = pack.deletedMessageCount ? pack.deletedMessageCount : null;
		this.messageContent = pack.messageContent ? pack.messageContent : null;
		this.badNickname = pack.badNickname ? pack.badNickname : null;
		return this;
	}

	// Internal Functions

	async _getID() {
		if (this.submitted) throw 'Cases cannot be changed once submitted!';
		for (let i = 0; ; i++) {
			if (await this.client.settings.moderation.cases.find(obj => obj.id === `${this.type}_${this.timestamp}${i}`)) continue;
			return `${this.type}_${this.timestamp}${i}`;
		}
	}

	async _getPack() {
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
		return pack;
	}


};
