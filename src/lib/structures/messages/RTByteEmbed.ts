import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { container } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import i18next from 'i18next';

export class RTByteEmbed extends MessageEmbed {

	public constructor(message: Message) {
		super();
		this.setColor(Colors.white)
		this.setThumbnail(String(container.client.user?.displayAvatarURL()))
		this.setTimestamp()
		this.setFooter(i18next.t(LanguageKeys.Globals.EmbedRequestedBy, { requester: message.author.tag }), message.author.displayAvatarURL())
	}
}
