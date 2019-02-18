const { Client, Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true,
			event: 'ready'
		});
	}

	async run() {
		await this.client.emit('verbose', 'Ensuring guild variables are created.');
	}

};
