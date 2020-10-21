const { Extendable, KlasaMessage } = require('klasa');
const { Emojis } = require('../../lib/util/constants');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async arrowLeft(message = null, messageOptions = {}) {
		const arrowLeftEmoji = await this.client.emojis.cache.get(Emojis.arrowLeft);
		await this.react(arrowLeftEmoji);
		return message ? this.sendMessage(`${this.author}\n${arrowLeftEmoji} ${message}`, messageOptions) : this;
	}

};
