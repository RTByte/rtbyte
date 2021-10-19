import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand, RTByteEmbed } from '#lib/structures';
import { VERSION } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { reply } from '@sapphire/plugin-editable-commands';
import { Message, Permissions } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	description: LanguageKeys.Commands.User.InfoDescription,
	requiredClientPermissions: [Permissions.FLAGS.EMBED_LINKS]
})
export class UserCommand extends RTByteCommand {
	public async messageRun(message: Message, args: RTByteCommand.Args) {
		const embed = new RTByteEmbed(message)
			.setAuthor(args.t(LanguageKeys.Commands.User.InfoEmbedTitle))
			.setDescription(args.t(LanguageKeys.Commands.User.InfoEmbedDescription))
			.addField(args.t(LanguageKeys.Commands.User.InfoEmbedTeamTitle), args.t(LanguageKeys.Commands.User.InfoEmbedTeamContent), true)
			.addField(args.t(LanguageKeys.Commands.User.InfoEmbedVersion), VERSION, true)
			.addField(args.t(LanguageKeys.Commands.User.InfoEmbedLinksTitle), args.t(LanguageKeys.Commands.User.InfoEmbedLinksContent))

		return reply(message, { embeds: [embed] })
	}
}
