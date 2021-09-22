import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { isNullish } from "@sapphire/utilities";
import { CategoryChannel, NewsChannel, StageChannel, StoreChannel, TextChannel, User, VoiceChannel } from "discord.js";
import type { TFunction } from 'i18next';

type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel | StageChannel;

@ApplyOptions<ListenerOptions>({ event: Events.ChannelCreate })
export class UserListener extends Listener<typeof SapphireEvents.ChannelCreate> {
	public async run(channel: GuildBasedChannel) {
		if (isNullish(channel.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('CHANNEL_CREATE', channel.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: channel.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.channelCreateLog) {
			this.container.client.emit(Events.GuildMessageLog, channel.guild, guildSettings?.logChannel, Events.ChannelCreate, this.serverLog(channel, auditLogExecutor, T));
		}
	}

	private serverLog(channel: GuildBasedChannel, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: channel.id }))
			.setType(Events.ChannelCreate)

		// Add category field if channel is in a category
		if (channel.parent) {
			embed.addField(t(LanguageKeys.Miscellaneous.Category), `<#${channel.parentId}>`);
		}

		// Set various author and footer fields depending on channel type, defaulting to standard text channel
		switch (channel.type) {
			case 'GUILD_CATEGORY':
				embed.setAuthor(channel.name, channel.guild.iconURL() as string);
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.CategoryCreated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_NEWS':
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.NewsChannelCreated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_STAGE_VOICE':
				embed.setAuthor(channel.name, channel.guild.iconURL() as string);
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.StageChannelCreated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_STORE':
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.StoreChannelCreated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_VOICE':
				embed.setAuthor(channel.name, channel.guild.iconURL() as string);
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.VoiceChannelCreated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			default:
				embed.setAuthor(`#${channel.name}`, channel.guild.iconURL() as string)
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.ChannelCreated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
		}

		return embed;
	}
}
