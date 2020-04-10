const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async reject(message = null, messageOptions = {}) {
		const rejectEmoji = await this.client.emojis.cache.get(this.client.settings.emoji.reject);
		await this.react(rejectEmoji);
		return message ? this.sendMessage(`${this.author}\n${rejectEmoji} ${message}`, messageOptions) : this;
	}

};
