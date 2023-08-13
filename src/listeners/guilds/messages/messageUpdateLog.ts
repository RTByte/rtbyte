import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getContent } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { cutText, inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { BaseGuildTextChannel, Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.MessageUpdate })
export class UserEvent extends Listener {
	public async run(oldMessage: Message, message: Message) {
		if (isNullish(message.id)) return;
		if (isNullish(message.guild)) return;
		if (message.author.bot) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: message.guild?.id } });
		if (!guildSettingsInfoLogs?.messageUpdateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = message.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldMessage, message));
	}

	private generateGuildLog(oldMessage: Message, message: Message) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: message.author.username,
				url: `https://discord.com/users/${message.author.id}`,
				iconURL: message.author.displayAvatarURL()
			})
			.setDescription(`<#${message.channel.id}> - [${inlineCodeBlock(`go to message`)}](${message.url})`)
			.setFooter({ text: 'Message edited' })
			.setType(Events.MessageUpdate);

		const oldMessageContent = getContent(oldMessage);
		const messageContent = getContent(message);
		if (oldMessageContent !== messageContent) {
			if (oldMessageContent) embed.addFields({ name: 'Before', value: cutText(oldMessageContent, 1024) });
			if (messageContent) embed.addFields({ name: 'After', value: cutText(messageContent, 1024) });
		}

		if (!embed.data.fields?.length) return;
		return [embed]
	}
}
