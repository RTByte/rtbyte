import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand } from '#lib/structures';
import { pickRandom } from '#root/lib/util/util';
import { ApplyOptions } from '@sapphire/decorators';
import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['choose', 'decide'],
	description: LanguageKeys.Commands.User.ChoiceDescription
})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const input = await args.repeatResult('string');

		if (!input.success) return reply(message, args.t(LanguageKeys.Commands.User.ChoiceTooFew));
		if (input.value.length < 2) return reply(message, args.t(LanguageKeys.Commands.User.ChoiceTooFew));

		return reply(message, `🤔 ${pickRandom(input.value)}`);
	}
}
