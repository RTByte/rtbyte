import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<CommandOptions>({
	description: 'commands/user:coinflip.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message) {
		const chance = Math.random() > 0.5;

		return msg.reply(chance ? await msg.fetchLanguageKey('commands/user:coinflip.responses.heads') : await msg.fetchLanguageKey('commands/user:coinflip.responses.tails'));
	}

}
