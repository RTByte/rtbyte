import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand, RTByteEmbed } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { Colors } from '#root/lib/util/constants';
import { getContent, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
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
		const remoteMessage = await args.pick('message', { channel });
		const fetchedChannel = message.guild.channels.cache.get(channel.id);

		const embed = new RTByteEmbed(message)
			.setAuthor(remoteMessage.author.tag, remoteMessage.author.displayAvatarURL())
			.setDescription(`[${args.t(LanguageKeys.Globals.EmbedClickToView)}](${remoteMessage.url})`)
			.setColor(remoteMessage.member?.displayColor as ColorResolvable ?? Colors.White)
			.setImage(getImage(remoteMessage)!)
			.setThumbnail('')
			.setFooter(args.t(LanguageKeys.Commands.User.QuoteEmbedFooter, { channel: `#${fetchedChannel?.name}`}))

		const content = getContent(remoteMessage);
		if (content) embed.addField(args.t(LanguageKeys.Miscellaneous.Message), cutText(content, 1024));

		return reply(message, { embeds: [embed] })
	}
}
