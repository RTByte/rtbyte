import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand } from '#lib/structures';
import { VERSION } from '#root/config';
import { Colors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	description: LanguageKeys.Commands.User.InfoDescription
})
export class UserCommand extends RTByteCommand {
	public async run(message: Message, args: RTByteCommand.Args) {
		const embed = new MessageEmbed()
			.setColor(Colors.white)
			.setThumbnail(String(this.container.client.user?.displayAvatarURL()))
			.setTimestamp()
			.setFooter(args.t(LanguageKeys.Globals.EmbedRequestedBy, { requester: message.author.tag }), message.author.displayAvatarURL())

			.setAuthor(args.t(LanguageKeys.Commands.User.InfoEmbedTitle))
			.setDescription(args.t(LanguageKeys.Commands.User.InfoEmbedDescription))
			.addField(args.t(LanguageKeys.Commands.User.InfoEmbedTeamTitle), args.t(LanguageKeys.Commands.User.InfoEmbedTeamContent), true)
			.addField(args.t(LanguageKeys.Commands.User.InfoEmbedVersion), VERSION, true)
			.addField(args.t(LanguageKeys.Commands.User.InfoEmbedLinksTitle), args.t(LanguageKeys.Commands.User.InfoEmbedLinksContent))

		return message.reply({ embeds: [embed] })
	}
}
