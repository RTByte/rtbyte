const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async arrowToRight(message = null, messageOptions = {}) {
		const arrowToRightEmoji = await this.client.emojis.cache.get(this.client.settings.emoji.arrowToRight);
		await this.react(arrowToRightEmoji);
		return message ? this.sendMessage(`${this.author}\n${arrowToRightEmoji} ${message}`, messageOptions) : this;
	}

};
