import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { Emojis } from '#utils/constants';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, GuildMember, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberUpdate })
export class UserEvent extends Listener {
	public async run(oldMember: GuildMember, member: GuildMember) {
		if (isNullish(member.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: member.guild.id } });
		if (!guildSettingsInfoLogs?.guildMemberUpdateLog || !guildSettingsInfoLogs.infoLogChannel) return;

		const logChannel = member.guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.MemberUpdate, member.guild);

		return this.container.client.emit('guildLogCreate', logChannel, this.generateGuildLog(oldMember, member, executor));
	}

	private generateGuildLog(oldMember: GuildMember, member: GuildMember, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: member.user.username,
				url: `https://discord.com/users/${member.user.id}`,
				iconURL: member.user.displayAvatarURL()
			})
			.setDescription(inlineCodeBlock(member.id))
			.setFooter({ text: `Member updated ${isNullish(executor) ? '' : executor.id === member.id ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor.id === member.id ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildMemberUpdate);

		const changes = [];
		if (oldMember.displayName !== member.displayName) changes.push(`${Emojis.Bullet}**Display name**: ${inlineCodeBlock(`${oldMember.displayName}`)} to ${inlineCodeBlock(`${member.displayName}`)}`);
		if (oldMember.roles.cache !== member.roles.cache) {
			const oldRoles = oldMember.roles.cache;
			const roles = member.roles.cache;
			const addedRoles = [];
			const removedRoles = [];
			for (const [key, role] of roles.entries()) {
				if (!oldRoles.has(key)) addedRoles.push(`${role}`);
			}
			for (const [key, role] of oldRoles.entries()) {
				if (!roles.has(key)) removedRoles.push(`${role}`);
			}

			if (addedRoles.length) changes.push(`${Emojis.Bullet}**Role${addedRoles.length > 1 ? 's' : ''} added**: ${addedRoles.join(' ')}`);
			if (removedRoles.length) changes.push(`${Emojis.Bullet}**Role${removedRoles.length > 1 ? 's' : ''} removed**: ${removedRoles.join(' ')}`);
		}
		if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });

		return [embed]
	}
}
