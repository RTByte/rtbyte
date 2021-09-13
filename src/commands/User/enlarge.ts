import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand } from '#lib/structures';
import { REGEX } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { reply } from '@sapphire/plugin-editable-commands';
import { Message, MessageAttachment, Permissions } from 'discord.js';
import { parse as parseEmoji } from 'twemoji-parser';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['bigemoji'],
	description: LanguageKeys.Commands.User.EnlargeDescription,
	requiredClientPermissions: [Permissions.FLAGS.ATTACH_FILES]

})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const input = await args.pickResult('string');

		if (!input.success) return reply(message, args.t(LanguageKeys.Commands.User.EnlargeNoneSpecified))

		// Parse native emoji
		const emoji = parseEmoji(input.value, { assetType: 'png' })[0];

		// Parse custom emoji
		const customEmojiRegex = input.value.match(REGEX.emoji);
		const animated = input.value.match(REGEX.emojiAnimated);
		const customEmoji = customEmojiRegex ? customEmojiRegex[1] : null;

		// Return if neither emoji type can be parsed
		if (!emoji && !customEmoji) return reply(message, args.t(LanguageKeys.Commands.User.EnlargeInvalidInput, { input: input.value }))

		const emojiAttachment = new MessageAttachment(emoji
			? emoji.url
			: `https://cdn.discordapp.com/emojis/${customEmoji}.${animated ? 'gif' : 'png'}`);
		return reply(message, {files: [emojiAttachment] });
	}
}
