const { Extendable, KlasaMessage } = require('klasa');
const { Emojis } = require('../../lib/util/constants');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async arrowToRight(message = null, messageOptions = {}) {
		const arrowToRightEmoji = await this.client.emojis.cache.get(Emojis.arrowToRight);
		await this.react(arrowToRightEmoji);
		return message ? this.sendMessage(`${this.author}\n${arrowToRightEmoji} ${message}`, messageOptions) : this;
	}

};
