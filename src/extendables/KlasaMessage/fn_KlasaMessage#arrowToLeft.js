const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async arrowToLeft(message = null, messageOptions = {}) {
		const arrowToLeftEmoji = await this.client.emojis.get(this.client.settings.emoji.arrowToLeft);
		await this.react(arrowToLeftEmoji);
		return message ? this.sendMessage(`${this.author}\n${arrowToLeftEmoji} ${message}`, messageOptions) : this;
	}

};
