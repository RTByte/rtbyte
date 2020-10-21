const { Extendable, KlasaMessage } = require('klasa');
const { Emojis } = require('../../lib/util/constants');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async reject(message = null, messageOptions = {}) {
		const rejectEmoji = await this.client.emojis.cache.get(Emojis.reject);
		await this.react(rejectEmoji);
		return message ? this.sendMessage(`${this.author}\n${rejectEmoji} ${message}`, messageOptions) : this;
	}

};
