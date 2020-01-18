const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async arrowRight(message = null, messageOptions = {}) {
		const arrowRightEmoji = await this.client.emojis.get(this.client.settings.get('emoji.arrowRight'));
		await this.react(arrowRightEmoji);
		return message ? this.sendMessage(`${this.author}\n${arrowRightEmoji} ${message}`, messageOptions) : this;
	}

};
