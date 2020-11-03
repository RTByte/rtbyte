import { Args, Command, CommandOptions } from '@sapphire/framework';
import { Message, MessageAttachment } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { REGEX } from '@util/constants';

@ApplyOptions<CommandOptions>({
	aliases: ['bigemoji'],
	description: 'commands/user:enlarge.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message, args: Args) {
		const input = await args.pickResult('string');

		if (!input.success) return msg.reply(`\n${await msg.fetchLanguageKey('commands/user:enlarge.responses.noneSpecified')}`);

		const regex = input.value.match(REGEX.emoji);
		const animated = input.value.match(REGEX.emojiAnimated);
		const emoji = regex ? regex[1] : null;

		if (!emoji) return msg.reply(`\n${await msg.fetchLanguageKey('commands/user:enlarge.responses.noneSpecified')}`);

		const emojiAttachment = new MessageAttachment(`https://cdn.discordapp.com/emojis/${emoji}.${animated ? 'gif' : 'png'}`);
		return msg.channel.send(emojiAttachment);
	}

}
