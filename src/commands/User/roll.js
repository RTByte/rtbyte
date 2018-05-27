const { Command } = require('klasa');
const validTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['dice', 'd20'],
			permissionLevel: 0,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: (msg) => msg.language.get('COMMAND_ROLL_DESCRIPTION'),
			usage: '[amount:int{1,10}] [d4|d6|d8|d10|d12|d20]',
			usageDelim: ' '
		});
	}

	async run(msg, [amount = 1, type = 'd6']) {
		if (msg.content.startsWith(`${msg.guild.configs.prefix}d20`)) type = 'd20';
		if (!validTypes.includes(type)) return msg.reject(msg.guild.language.get('COMMAND_ROLL_INVALID_DIE', validTypes));
		const faces = JSON.parse(type.substr(1));
		const dice = await this.rollDice(faces, amount);

		return msg.reply(`here are the dice you rolled.\n 🎲**${dice.join('**, 🎲**')}**\n\nTotal: **${dice.reduce((a, b) => a + b, 0)}**`);
	}

	async rollDice(faces, amount) {
		console.log(`Rolling ${amount} d${faces}`);
		const dice = [];

		for (let i = 0; i < amount; i++) {
			dice.push(Math.floor(Math.random() * faces) + 1);
		}

		return dice;
	}


};
