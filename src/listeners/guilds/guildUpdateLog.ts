import { GuildLogEmbed } from '#lib/extensions/GuildLogEmbed';
import { seconds } from '#utils/common/times';
import { Emojis } from '#utils/constants';
import { getAuditLogExecutor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { DurationFormatter } from '@sapphire/time-utilities';
import { codeBlock, inlineCodeBlock, isNullish } from '@sapphire/utilities';
import { AuditLogEvent, BaseGuildTextChannel, Guild, GuildFeature, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildUpdate })
export class UserEvent extends Listener {
	public async run(oldGuild: Guild, guild: Guild) {
		if (isNullish(guild.id)) return;

		const guildSettingsInfoLogs = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: guild.id } });
		if (!guildSettingsInfoLogs?.guildUpdateLog || !guildSettingsInfoLogs?.infoLogChannel) return;

		const infoLogChannel = guild.channels.resolve(guildSettingsInfoLogs.infoLogChannel) as BaseGuildTextChannel;
		const executor = await getAuditLogExecutor(AuditLogEvent.GuildUpdate, guild);

		return this.container.client.emit('guildLogCreate', infoLogChannel, this.generateGuildLog(oldGuild, guild, executor));
	}

	private generateGuildLog(oldGuild: Guild, guild: Guild, executor: User | null | undefined) {
		const embed = new GuildLogEmbed()
			.setAuthor({
				name: guild.name,
				url: guild.vanityURLCode ? `https://discord.gg/${guild.vanityURLCode}` : undefined,
				iconURL: guild.iconURL() ?? undefined
			})
			.setDescription(inlineCodeBlock(guild.id))
			.setFooter({ text: `Server updated ${isNullish(executor) ? '' : `by ${executor.username}`}`, iconURL: isNullish(executor) ? undefined : executor?.displayAvatarURL() })
			.setType(Events.GuildUpdate);

		const changes = [];
		if (oldGuild.name !== guild.name) changes.push(`${Emojis.Bullet}**Name**: ${inlineCodeBlock(`${oldGuild.name}`)} to ${inlineCodeBlock(`${guild.name}`)}`);
		if (oldGuild.afkChannel !== guild.afkChannel) changes.push(`${Emojis.Bullet}**Inactive channel**: ${oldGuild.afkChannelId ? `<#${oldGuild.afkChannelId}>` : inlineCodeBlock('No inactive channel')} to ${guild.afkChannelId ? `<#${guild.afkChannelId}>` : inlineCodeBlock('No inactive channel')}`);
		if (oldGuild.afkTimeout !== guild.afkTimeout) changes.push(`${Emojis.Bullet}**Inactive timeout**: ${inlineCodeBlock(`${oldGuild.afkTimeout ? new DurationFormatter().format(seconds(oldGuild.afkTimeout)) : 'Disabled'}`)} to ${inlineCodeBlock(`${guild.afkTimeout ? new DurationFormatter().format(seconds(guild.afkTimeout)) : 'Disabled'}`)}`);
		if (oldGuild.systemChannel !== guild.systemChannel) changes.push(`${Emojis.Bullet}**System messages channel**: ${oldGuild.systemChannel ? `<#${oldGuild.systemChannelId}>` : inlineCodeBlock('No system messages')} to ${guild.systemChannel ? `<#${guild.systemChannelId}>` : inlineCodeBlock('No system messages')}`);
		// TODO: implement changes for system channel flags
		if (oldGuild.defaultMessageNotifications !== guild.defaultMessageNotifications) {
			const defaultMessageNotifications = ['All messages', 'Only @mentions'];
			changes.push(`${Emojis.Bullet}**Default notification settings**: ${inlineCodeBlock(`${defaultMessageNotifications[oldGuild.defaultMessageNotifications]}`)} to ${inlineCodeBlock(`${defaultMessageNotifications[guild.defaultMessageNotifications]}`)}`);
		}
		if (oldGuild.premiumProgressBarEnabled !== guild.premiumProgressBarEnabled) changes.push(`${Emojis.Bullet}**Show boost progress bar**: ${guild.premiumProgressBarEnabled ? Emojis.ToggleOn : Emojis.ToggleOff}`)
		if (oldGuild.banner !== guild.banner) changes.push(`${Emojis.Bullet}**Banner background**: [${inlineCodeBlock('click to view')}](${oldGuild.bannerURL()}) to [${inlineCodeBlock('click to view')}](${guild.bannerURL()})`);
		if (oldGuild.splash !== guild.splash) changes.push(`${Emojis.Bullet}**Invite background**: [${inlineCodeBlock('click to view')}](${oldGuild.splashURL()}) to [${inlineCodeBlock('click to view')}](${guild.splashURL()})`);
		if (oldGuild.widgetEnabled !== null && oldGuild.widgetEnabled !== guild.widgetEnabled) changes.push(`${Emojis.Bullet}**Widget**: ${guild.widgetEnabled ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		if (oldGuild.widgetChannel !== guild.widgetChannel) changes.push(`${Emojis.Bullet}**Invite channel**: ${oldGuild.widgetChannel ? `<#${oldGuild.widgetChannelId}>` : inlineCodeBlock('No invite')} to ${guild.widgetChannel ? `<#${guild.widgetChannelId}>` : inlineCodeBlock('No invite')}`);
		if (oldGuild.vanityURLCode !== guild.vanityURLCode) changes.push(`${Emojis.Bullet}**Custom invite link**: [${inlineCodeBlock(`discord.gg/${oldGuild.vanityURLCode}`)}](https://discord.gg/${oldGuild.vanityURLCode}) to [${inlineCodeBlock(`discord.gg/${guild.vanityURLCode}`)}](https://discord.gg/${guild.vanityURLCode})`);
		if (oldGuild.verificationLevel !== guild.verificationLevel) {
			const verificationLevel = ['', 'Low', 'Medium', 'High', 'Highest'];
			changes.push(`${Emojis.Bullet}**Verification level**: ${inlineCodeBlock(`${verificationLevel[oldGuild.verificationLevel]}`)} to ${inlineCodeBlock(`${verificationLevel[guild.verificationLevel]}`)}`);
		}
		if (oldGuild.features !== guild.features) {
			if (oldGuild.features.includes(GuildFeature.PreviewEnabled) !== guild.features.includes(GuildFeature.PreviewEnabled)) changes.push(`${Emojis.Bullet}**Members must accept rules before they can talk or DM**: ${guild.features.includes(GuildFeature.PreviewEnabled) ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		}
		if (oldGuild.explicitContentFilter !== guild.explicitContentFilter) {
			const explicitContentFilter = ['Do not filter', 'Filter for members without roles', 'Filter for all members'];
			changes.push(`${Emojis.Bullet}**Explicit image filter**: ${inlineCodeBlock(`${explicitContentFilter[oldGuild.explicitContentFilter]}`)} to ${inlineCodeBlock(`${explicitContentFilter[guild.explicitContentFilter]}`)}`);
		}
		if (oldGuild.mfaLevel !== guild.mfaLevel) changes.push(`${Emojis.Bullet}**2FA required for moderator actions**: ${guild.mfaLevel === 1 ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		if (oldGuild.rulesChannel !== guild.rulesChannel) changes.push(`${Emojis.Bullet}**Rules channel**: ${oldGuild.rulesChannel ? `<#${oldGuild.rulesChannelId}>` : inlineCodeBlock('Not set')} to ${guild.rulesChannel ? `<#${guild.rulesChannelId}>` : inlineCodeBlock('Not set')}`);
		if (oldGuild.publicUpdatesChannel !== guild.publicUpdatesChannel) changes.push(`${Emojis.Bullet}**Community updates channel**: ${oldGuild.publicUpdatesChannel ? `<#${oldGuild.publicUpdatesChannelId}>` : inlineCodeBlock('Not set')} to ${guild.publicUpdatesChannel ? `<#${guild.publicUpdatesChannelId}>` : inlineCodeBlock('Not set')}`);
		if (oldGuild.safetyAlertsChannel !== guild.safetyAlertsChannel) changes.push(`${Emojis.Bullet}**Safety notifications channel**: ${oldGuild.safetyAlertsChannel ? `<#${oldGuild.safetyAlertsChannelId}>` : inlineCodeBlock('Disabled')} to ${guild.safetyAlertsChannel ? `<#${guild.safetyAlertsChannelId}>` : inlineCodeBlock('Disabled')}`);
		if (oldGuild.preferredLocale !== guild.preferredLocale) changes.push(`${Emojis.Bullet}**Primary language**: ${oldGuild.preferredLocale} to ${guild.preferredLocale}`);
		if (oldGuild.description !== guild.description) changes.push(`${Emojis.Bullet}**Description**:\n${oldGuild.description ? codeBlock(`${oldGuild.description}`) : codeBlock('Not set')}to\n${guild.description ? codeBlock(`${guild.description}`) : codeBlock('Not set')}`);
		if (oldGuild.features !== guild.features) {
			if (oldGuild.features.includes(GuildFeature.Community) !== guild.features.includes(GuildFeature.Community)) changes.push(`${Emojis.Bullet}**Community**: ${guild.features.includes(GuildFeature.Community) ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		}
		if (oldGuild.partnered !== guild.partnered) changes.push(`${Emojis.Bullet}**Partnered**: ${guild.partnered ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		if (oldGuild.features !== guild.features) {
			if (oldGuild.features.includes(GuildFeature.Discoverable) !== guild.features.includes(GuildFeature.Discoverable)) changes.push(`${Emojis.Bullet}**Discoverable**: ${guild.features.includes(GuildFeature.Discoverable) ? Emojis.ToggleOn : Emojis.ToggleOff}`);
			if (oldGuild.features.includes(GuildFeature.WelcomeScreenEnabled) !== guild.features.includes(GuildFeature.WelcomeScreenEnabled)) changes.push(`${Emojis.Bullet}**Welcome screen**: ${guild.features.includes(GuildFeature.WelcomeScreenEnabled) ? Emojis.ToggleOn : Emojis.ToggleOff}`);
		}
		if (changes.length) embed.addFields({ name: 'Changes', value: changes.join('\n') });

		if (changes.length) return [embed];
		return [];
	}
}