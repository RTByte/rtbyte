const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['network', 'community', 'rtfam'],
			enabled: true,
			runIn: ['text'],
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			permissionLevel: 0
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setAuthor('RT Family Discord Servers', this.client.user.avatarURL())
			.setColor('#ffffff')
			.setDescription('Click the name of the Discord server you want to join!')
			.addField('Let\'s Play Network', '• [Cow Chop Community](https://discord.gg/cowchop)\n• [Kinda Funny](https://discord.gg/kindafunny)\n• [Sugar Pine 7 Community](https://discord.gg/HUHExdK)\n• [Game Attack/Screwattack G1](https://discord.gg/F8fncjr)', true) // eslint-disable-line max-len
			.addField('Rooster Teeth', '• [Rooster Teeth Community](https://https://discord.gg/roosterteeth)\n• [Achievement Hunter Community](https://discord.gg/P8cJ9vC)\n• [RTX 2018](https://discord.gg/0oqF8OqUW3gQDZD2)', true) // eslint-disable-line max-len
			.addField('Rooster Teeth Shows', '• [/r/RWBY](https://discord.gg/rwby)', true);
		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
