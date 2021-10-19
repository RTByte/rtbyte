import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand, RTByteEmbed } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { reply } from '@sapphire/plugin-editable-commands';
import { Message, Permissions } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	description: LanguageKeys.Commands.User.InviteDescription,
	requiredClientPermissions: [Permissions.FLAGS.EMBED_LINKS]
})
export class UserCommand extends RTByteCommand {
	public async messageRun(message: Message, args: RTByteCommand.Args) {
		const embed = new RTByteEmbed(message)
			.setAuthor(args.t(LanguageKeys.Commands.User.InviteEmbedTitle))
			.setDescription(args.t(LanguageKeys.Commands.User.InviteEmbedDescription))

		return reply(message, { embeds: [embed] })
	}
}
