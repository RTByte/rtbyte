import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['coin'],
	description: LanguageKeys.Commands.User.CoinflipDescription
})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const chance = Math.random() > 0.5;

		return message.reply(chance ? args.t(LanguageKeys.Commands.User.CoinflipHeads) : args.t(LanguageKeys.Commands.User.CoinflipTails))
	}
}
