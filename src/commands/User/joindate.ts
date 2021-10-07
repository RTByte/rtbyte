import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand, RTByteEmbed } from '#lib/structures';
import { sendTemporaryMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { reply } from '@sapphire/plugin-editable-commands';
import { Message, Permissions } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['me', 'myself', 'age'],
	description: LanguageKeys.Commands.User.JoindateDescription,
	requiredClientPermissions: [Permissions.FLAGS.EMBED_LINKS]
})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const user = await args.pick('userName').catch(() => message.author);
		const member = message.guild?.members.cache.get(user.id);

		if (member === undefined) return sendTemporaryMessage(message, args.t(LanguageKeys.Commands.User.JoindateUserNotMember, { input: user }))

		const joinPositions = await message.guild?.members.fetch().then(mbrs => mbrs.sort((first, last) => Number(first.joinedTimestamp) - Number(last.joinedTimestamp)));
		const position = Number(joinPositions?.map(mbr => mbr.user).indexOf(user)) + 1;
		const joinedTimestampOffset = Date.now() - Number(member?.joinedTimestamp);
		const createdTimestampOffset = Date.now() - user.createdTimestamp;

		const embed = new RTByteEmbed(message)
			.setAuthor(user.tag, user.displayAvatarURL())
			.setThumbnail(user.displayAvatarURL());

		if (position === 1 && message.guild?.ownerId === user.id) embed.setDescription(args.t(LanguageKeys.Miscellaneous.ServerCreator))

		embed.addField(args.t(LanguageKeys.Commands.User.JoindateEmbedJoinPosition), args.t(LanguageKeys.Commands.User.JoindateEmbedJoinPositionNumber, { position }))
		embed.addField(args.t(LanguageKeys.Miscellaneous.Joined), args.t(LanguageKeys.Commands.User.JoindateEmbedJoined, { joinedTimestampOffset, joinedAt: member?.joinedAt}))
		embed.addField(args.t(LanguageKeys.Miscellaneous.Registered), args.t(LanguageKeys.Commands.User.JoindateEmbedCreated, { createdTimestampOffset, createdAt: user.createdAt }))

		return reply(message, { embeds: [embed] });
	}
}
