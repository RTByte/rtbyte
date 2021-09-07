import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand } from '#lib/structures';
import { Colors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	description: LanguageKeys.Commands.User.InviteDescription
})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const embed = new MessageEmbed()
			.setColor(Colors.white)
			.setThumbnail(String(this.container.client.user?.displayAvatarURL()))
			.setTimestamp()
			.setFooter(args.t(LanguageKeys.Globals.EmbedRequestedBy, { requester: message.author.tag }), message.author.displayAvatarURL())

			.setAuthor(args.t(LanguageKeys.Commands.User.InviteEmbedTitle))
			.setDescription(args.t(LanguageKeys.Commands.User.InviteEmbedDescription))

		return message.reply({ embeds: [embed] })
	}
}
