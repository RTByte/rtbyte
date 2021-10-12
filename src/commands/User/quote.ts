import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand, RTByteEmbed } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { sendTemporaryMessage } from '#utils/functions';
import { getContent, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { ChannelMentionRegex } from '@sapphire/discord.js-utilities';
import { reply } from '@sapphire/plugin-editable-commands';
import { cutText } from '@sapphire/utilities';
import { ColorResolvable, Permissions } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	description: LanguageKeys.Commands.User.QuoteDescription,
	requiredClientPermissions: [Permissions.FLAGS.EMBED_LINKS]
})
export class UserCommand extends RTByteCommand {
	public async run(message: GuildMessage, args: RTByteCommand.Args) {
		const channel = await args.pick('textChannelName').catch(() => message.channel);

		// Protect against 'Unknown Message' errors with no response if a message ID from another channel is provided without the channel having been specified
		const unknownMessageGuard = await args.peek('message', { channel }).catch(() => message);
		if (unknownMessageGuard.id === message.id) {
			const parameters = await args.repeat('string');

			// Protect against returning a channel mention as opposed to the message ID as expected if the bot doesn't have access to the specified channel
			const firstArgIsChannel = ChannelMentionRegex.test(parameters[0])

			return sendTemporaryMessage(message, args.t(LanguageKeys.Arguments.MessageError, { parameter: firstArgIsChannel ? parameters[1] : parameters[0], channel}));
		}

		const remoteMessage = await args.pick('message', { channel });
		const fetchedChannel = message.guild.channels.cache.get(remoteMessage.channel.id);

		const embed = new RTByteEmbed(message)
			.setAuthor(remoteMessage.author.tag, remoteMessage.author.displayAvatarURL())
			.setDescription(`[${args.t(LanguageKeys.System.ClickToView)}](${remoteMessage.url})`)
			.setColor(remoteMessage.member?.displayColor as ColorResolvable ?? Colors.White)
			.setImage(getImage(remoteMessage)!)
			.setThumbnail('')
			.setTimestamp(remoteMessage.createdTimestamp)
			.setFooter(args.t(LanguageKeys.Commands.User.QuoteEmbedFooter, { channel: `#${fetchedChannel?.name}`}))

		const content = getContent(remoteMessage);
		if (content) embed.addField(args.t(LanguageKeys.Miscellaneous.Message), cutText(content, 1024));

		return reply(message, { embeds: [embed] })
	}
}
