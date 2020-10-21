const { Extendable, KlasaMessage } = require('klasa');
const { Emojis } = require('../../lib/util/constants');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async arrowRight(message = null, messageOptions = {}) {
		const arrowRightEmoji = await this.client.emojis.cache.get(Emojis.arrowRight);
		await this.react(arrowRightEmoji);
		return message ? this.sendMessage(`${this.author}\n${arrowRightEmoji} ${message}`, messageOptions) : this;
	}

};
