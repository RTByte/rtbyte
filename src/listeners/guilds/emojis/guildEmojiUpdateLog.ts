import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { Emojis } from '#utils/constants';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, GuildEmoji, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildEmojiUpdate })
export class UserEvent extends Listener {
	public async run(oldEmoji: GuildEmoji, emoji: GuildEmoji) {
		if (isNullish(emoji.id)) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: emoji.guild.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.emoji) return;

		const logChannel = emoji.guild.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.EmojiUpdate, emoji.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldEmoji, emoji, executor));
	}

	private generateGuildLog(oldEmoji: GuildEmoji, emoji: GuildEmoji, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `:${emoji.name}:`,
				url: emoji.url,
				iconURL: emoji.url
			})
			.setDescription(inlineCodeBlock(emoji.id))
			.setThumbnail(emoji.url)
			.setFooter({ text: `Emoji updated ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildEmojiUpdate);

		const changes = [];
		if (oldEmoji.name !== emoji.name) changes.push(`${Emojis.Bullet}**Name**: ${inlineCodeBlock(`${oldEmoji.name}`)} to ${inlineCodeBlock(`${emoji.name}`)}`);
		if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });

		return [embed]
	}
}
