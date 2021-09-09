import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand } from '#lib/structures';
import { pickRandom } from '#root/lib/util/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['magicconch'],
	description: LanguageKeys.Commands.User.EightballDescription
})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const input = await args.pickResult('string');

		if (!input.success) return reply(message, args.t(LanguageKeys.Commands.User.EightballNoQuestion));

		const chance = Math.random();
		const answers:readonly string[] = args.t(LanguageKeys.Commands.User.EightballAnswers);

		if (chance > 0.85) {
			const { image } = await fetch<YesNoResultOk>('https://yesno.wtf/api', FetchResultTypes.JSON);
			const attachment = image;

			return reply(message, { content: '🎱', files: [attachment] })
		}

		return reply(message, `🎱 ${pickRandom(answers)}`)

	}
}

export interface YesNoResultOk {
	answer: string,
	forced: boolean,
	image: string
}
