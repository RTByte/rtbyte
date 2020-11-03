import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<CommandOptions>({
	description: 'commands/user:ping.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message) {
		return msg.channel.send(await msg.fetchLanguageKey('commands/user:ping.response', { ms: `${Math.round(this.client.ws.ping)}` }));
	}

}
