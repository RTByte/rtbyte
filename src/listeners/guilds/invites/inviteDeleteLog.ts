import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { Emojis } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { BaseGuildTextChannel, ChannelType, Guild, Invite, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.InviteDelete })
export class UserEvent extends Listener {
	public async run(invite: Invite) {
		if (isNullish(invite.guild)) return;

		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: invite.guild.id }});
		if (!dbGuildLogs?.logsEnabled || !dbGuildLogs.logChannel || !dbGuildLogs.invites) return;

		const guild = this.container.client.guilds.resolve(invite.guild.id);
		const fetchedInvite = await guild?.invites.fetch({ code: invite.code });
		const logChannel = guild?.channels.resolve(dbGuildLogs.logChannel) as BaseGuildTextChannel;
		const executor = invite.inviter;

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(fetchedInvite, guild, executor));
	}

	private generateGuildLog(invite: Invite | undefined, guild: Guild | null, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `${invite?.code}`,
				url: `https://discord.gg/${invite?.code}`,
				iconURL: guild?.iconURL() as string
			})
			.setDescription(`[${inlineCodeBlock(`discord.gg/${invite?.code}`)}](https://discord.gg/${invite?.code})`)
			.setFooter({ text: `Invite deleted ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.InviteDelete);

		let channelType;
		switch (invite?.channel?.type) {
			case ChannelType.GuildAnnouncement:
				channelType = 'Announcement channel';
				break;
			case ChannelType.GuildForum:
				channelType = 'Forum channel';
				break;
			case ChannelType.GuildStageVoice:
				channelType = 'Stage channel';
				break;
			case ChannelType.GuildText:
				channelType = 'Text channel';
				break;
			case ChannelType.GuildVoice:
				channelType = 'Voice channel';
				break;
			default:
				break;
		}
		if (channelType) embed.addFields({ name: channelType, value: `<#${invite?.channelId}>`, inline: true });
		if (invite?.createdTimestamp) embed.addFields({ name: 'Created', value: `<t:${Math.round(invite.createdTimestamp as number / 1000)}:R>`, inline: true });
		if (invite?.maxUses) embed.addFields({ name: 'Uses', value: `${inlineCodeBlock(`${invite.uses}/${invite.maxUses}`)}`, inline: true });

		const details = [];
		if (invite?.temporary) details.push(`${Emojis.Bullet}${inlineCodeBlock(`Grants temporary membership`)}`);
		if (details.length) embed.addFields({ name: 'Details', value: details.join('\n') });

		return [embed]
	}
}
