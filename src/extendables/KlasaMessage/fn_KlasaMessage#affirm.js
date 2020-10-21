const { Extendable, KlasaMessage } = require('klasa');
const { Emojis } = require('../../lib/util/constants');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async affirm(message = null, messageOptions = {}) {
		const affirmEmoji = await this.client.emojis.cache.get(Emojis.affirm);
		await this.react(affirmEmoji);
		return message ? this.sendMessage(`${this.author}\n${affirmEmoji} ${message}`, messageOptions) : this;
	}

};
