import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<CommandOptions>({
	aliases: ['choose', 'decide'],
	description: 'commands/user:choice.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message, args: Args) {
		const choices = await args.repeatResult('string');

		if (!choices.success) return msg.reply(await msg.fetchLanguageKey('commands/user:choice.responses.tooFew'));
		if (choices.value.length < 2) return msg.reply(await msg.fetchLanguageKey('commands/user:choice.responses.tooFew'));

		return msg.reply(`\n🤔 ${choices.value[Math.floor(Math.random() * choices.value.length)]}`);
	}

}
