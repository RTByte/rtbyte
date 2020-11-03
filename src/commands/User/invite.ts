import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InfoEmbed } from '@lib/structures/InfoEmbed';

@ApplyOptions<CommandOptions>({
	description: 'commands/user:invite.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message) {
		const embed = await new InfoEmbed(msg).boilerplate(msg, 'commands/user:invite.embed.title', 'commands/user:invite.embed.description');

		return msg.channel.send(embed);
	}

}
