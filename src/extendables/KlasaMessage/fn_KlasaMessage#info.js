const { Extendable, KlasaMessage } = require('klasa');
const { Emojis } = require('../../lib/util/constants');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [KlasaMessage] });
	}

	async info(message = null, messageOptions = {}) {
		const infoEmoji = await this.client.emojis.cache.get(Emojis.info);
		await this.react(infoEmoji);
		return message ? this.sendMessage(`${this.author}\n${infoEmoji} ${message}`, messageOptions) : this;
	}

};
