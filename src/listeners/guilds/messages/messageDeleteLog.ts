import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getContent } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { cutText, isNullish } from '@sapphire/utilities';
import { BaseGuildTextChannel, Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.MessageDelete })
export class UserEvent extends Listener {
	public async run(message: Message) {
		if (isNullish(message.id)) return;
		if (isNullish(message.guild)) return;
		
		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: message.guild?.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.messages) return;

		const logChannel = message.guild.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(message));
	}

	private generateGuildLog(message: Message) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: message.author.username,
				url: `https://discord.com/users/${message.author.id}`,
				iconURL: message.author.displayAvatarURL()
			})
			.setDescription(`<#${message.channel.id}>`)
			.setFooter({ text: 'Message deleted' })
			.setType(Events.MessageDelete);

		const messageContent = getContent(message);
		if (messageContent) embed.addFields({ name: 'Message', value: cutText(messageContent, 1024) });
		if (message?.createdTimestamp) embed.addFields({ name: 'Sent', value: `<t:${Math.round(message.createdTimestamp as number / 1000)}:R>`, inline: true });

		return [embed]
	}
}
