/* eslint-disable @typescript-eslint/naming-convention */
import { Colors } from '@lib/util/constants';
import { Client, Message, MessageEmbed } from 'discord.js';

export class InfoEmbed extends MessageEmbed {

	private readonly client: Client;

	public constructor(msg: Message) {
		super();
		this.client = msg.client;
	}

	public async boilerplate(msg: Message, title: string, description?: string) {
		const embed = this.setTitle(await msg.fetchLanguageKey(title))
						  .setColor(Colors.white)
						  .setThumbnail(this.client.user!.displayAvatarURL())
						  .setTimestamp()
						  .setFooter(await msg.fetchLanguageKey('global:embeds.requestedBy', { requester: msg.author.tag }), msg.author.displayAvatarURL());
		if (description) embed.setDescription(await msg.fetchLanguageKey(description));

		return embed;
	}

}
