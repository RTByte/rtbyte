const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			name: 'reject',
			enabled: true,
			appliesTo: ['Message'],
			klasa: false
		});
	}

	async extend(message = null, messageOptions = {}) {
		const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
		await this.react(rejectEmoji);
		return message ? this.sendMessage(`${this.author}\n${rejectEmoji}${message}`, messageOptions) : this;
	}

};
