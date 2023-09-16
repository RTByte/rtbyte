import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { Emojis } from '#utils/constants';
import { getPermissionDifference } from '#utils/functions/permissions';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, Role, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildRoleUpdate })
export class UserEvent extends Listener {
	public async run(oldRole: Role, role: Role) {
		if (isNullish(role.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: role.guild.id } });
		if (!guildSettingsInfoLogs?.roleUpdateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = role.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.RoleUpdate, role.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldRole, role, executor));
	}

	private generateGuildLog(oldRole: Role, role: Role, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: `${role?.unicodeEmoji ?? ''} ${role.name}`,
				iconURL: role.guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(role.id))
			.setThumbnail(role?.iconURL() ?? role.guild?.iconURL() ?? null)
			.setFooter({ text: `Role updated ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildRoleUpdate);

		const changes = [];
		if (oldRole.name !== role.name) changes.push(`${Emojis.Bullet}**Name**: ${inlineCodeBlock(`${oldRole.name}`)} to ${inlineCodeBlock(`${role.name}`)}`);
		if (oldRole.color !== role.color) changes.push(`${Emojis.Bullet}**Color**: ${inlineCodeBlock(`${oldRole.hexColor}`)} to ${inlineCodeBlock(`${role.hexColor}`)}`);
		if (oldRole.icon !== role.icon) changes.push(`${Emojis.Bullet}**Icon**: ${oldRole.iconURL() ? `[${inlineCodeBlock('click to view')}](${oldRole.iconURL()})` : inlineCodeBlock('Not set')} to ${role.iconURL() ? `[${inlineCodeBlock('click to view')}](${role.iconURL()})` : inlineCodeBlock('Not set')}`);
		if (oldRole.hoist !== role.hoist) changes.push(`${Emojis.Bullet}**Displayed separately**: ${role.hoist ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		if (oldRole.mentionable !== role.mentionable) changes.push(`${Emojis.Bullet}**Mentionable**: ${role.mentionable ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		if (oldRole.permissions !== role.permissions) {
			const permissionDifference = getPermissionDifference(oldRole.permissions, role.permissions);
			if (permissionDifference.added.length) changes.push(`${Emojis.Bullet}**Permissions added**: ${permissionDifference.added.join(' ')}`);
			if (permissionDifference.removed.length) changes.push(`${Emojis.Bullet}**Permissions removed**: ${permissionDifference.removed.join(' ')}`);
		}
		if (oldRole.managed !== role.managed) changes.push(`${Emojis.Bullet}**Managed by external service**: ${role.managed ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });

		return [embed]
	}
}
