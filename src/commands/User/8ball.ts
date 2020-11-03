import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import fetch from 'node-fetch';

@ApplyOptions<CommandOptions>({
	aliases: ['magicconch'],
	description: 'commands/user:8ball.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message, args: Args) {
		const question = await args.pickResult('string');

		if (!question.success) return msg.reply(`\n🎱 ${await msg.fetchLanguageKey('commands/user:8ball.responses.noQuestion')}`);

		const chance = Math.random() * 100;
		const answers = await msg.fetchLanguageKey('commands/user:8ball.responses.answers');

		if (chance > 85) {
			const yesNo = await fetch('https://yesno.wtf/api').then(res => res.json());
			const attachment = yesNo?.image;

			return msg.reply('\n🎱', attachment);
		}

		return msg.reply(`\n🎱 ${answers[Math.floor(Math.random() * answers.length)]}`);
	}

}
