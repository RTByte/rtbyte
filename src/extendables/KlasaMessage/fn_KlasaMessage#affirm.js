const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async affirm(message = null, messageOptions = {}) {
		const affirmEmoji = await this.client.emojis.get(this.client.settings.get('emoji.affirm'));
		await this.react(affirmEmoji);
		return message ? this.sendMessage(`${this.author}\n${affirmEmoji} ${message}`, messageOptions) : this;
	}

};
