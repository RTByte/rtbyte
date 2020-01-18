const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async info(message = null, messageOptions = {}) {
		const infoEmoji = await this.client.emojis.get(this.client.settings.get('emoji.info'));
		await this.react(infoEmoji);
		return message ? this.sendMessage(`${this.author}\n${infoEmoji} ${message}`, messageOptions) : this;
	}

};
