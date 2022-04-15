import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors, ZeroWidthSpace } from '#utils/constants';
import { container } from '@sapphire/framework';
import { Message, MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';

export class RTByteEmbed extends MessageEmbed {

	public constructor(message: Message, t: TFunction) {
		super();
		this.setColor(Colors.White)
		this.setThumbnail(String(container.client.user?.displayAvatarURL({ format: 'png', size: 128 })))
		this.setTimestamp()
		this.setFooter({
			text: t(LanguageKeys.System.RequestedBy, { requester: message.author.tag }),
			iconURL: message.author.displayAvatarURL()
		})
	}

	public addBlankField() {
		this.addField(ZeroWidthSpace, ZeroWidthSpace);
	}
}
