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

	async extend() {
		const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
		await this.react(rejectEmoji);
		return this;
	}

};
