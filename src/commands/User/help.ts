import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InfoEmbed } from '@lib/structures/InfoEmbed';

@ApplyOptions<CommandOptions>({
	description: 'commands/user:help.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message, args: Args) {
		const input = await args.pickResult('string');

		if (input.success) {
			const cmd = this.client.commands.get(input.value);

			if (typeof cmd === 'undefined') return msg.reply(`\n${await msg.fetchLanguageKey('commands/user:help.responses.notFound', { cmd: input.value })}`);

			const embed = await new InfoEmbed(msg)
				.boilerplate(msg, 'commands/user:help.embed.title', cmd.description);

			embed.setTitle(cmd.name);
			if (cmd.detailedDescription) embed.addField(await msg.fetchLanguageKey('commands/user:help.embed.fields.details'), await msg.fetchLanguageKey(cmd.detailedDescription));

			return msg.channel.send(embed);
		}

		return msg.sendTranslated('commands/user:help.responses.noneSpecified');
	}

}
