import { VERSION } from '@root/config';
import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InfoEmbed } from '@lib/structures/InfoEmbed';

@ApplyOptions<CommandOptions>({
	description: 'commands/user:info.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message) {
		const embed = await new InfoEmbed(msg)
			.boilerplate(msg, 'commands/user:info.embed.title', 'commands/user:info.embed.description');

		embed.addField(await msg.fetchLanguageKey('commands/user:info.embed.fields.team.title'), await msg.fetchLanguageKey('commands/user:info.embed.fields.team.content'), true)
			 .addField(await msg.fetchLanguageKey('commands/user:info.embed.fields.version'), VERSION, true)
			 .addField(await msg.fetchLanguageKey('commands/user:info.embed.fields.links.title'), await msg.fetchLanguageKey('commands/user:info.embed.fields.links.content'));

		return msg.channel.send(embed);
	}

}
