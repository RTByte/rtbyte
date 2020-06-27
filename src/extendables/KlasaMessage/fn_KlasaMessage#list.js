const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async list(message = null, messageOptions = {}) {
		const listEmoji = await this.client.emojis.cache.get(this.client.settings.emoji.list);
		await this.react(listEmoji);
		return message ? this.sendMessage(`${this.author}\n${listEmoji} ${message}`, messageOptions) : this;
	}

};
