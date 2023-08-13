import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, Role, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildRoleCreate })
export class UserEvent extends Listener {
	public async run(role: Role) {
		if (isNullish(role.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: role.guild.id } });
		if (!guildSettingsInfoLogs?.roleCreateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = role.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.RoleCreate, role.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(role, executor));
	}

	private generateGuildLog(role: Role, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `${role?.unicodeEmoji ?? ''} ${role.name}`,
				iconURL: role.guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(role.id))
			.setFooter({ text: `Role created ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildRoleCreate);

		return [embed]
	}
}
