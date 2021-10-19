import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { minutes, seconds } from "#utils/common";
import { Emojis } from "#utils/constants";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { cutText, inlineCodeBlock, isNullish } from "@sapphire/utilities";
import { CategoryChannel, NewsChannel, StageChannel, StoreChannel, TextChannel, User, VoiceChannel } from "discord.js";
import type { TFunction } from 'i18next';

type GuildBasedChannel = TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel | StageChannel;

@ApplyOptions<ListenerOptions>({ event: Events.ChannelUpdate })
export class UserListener extends Listener<typeof SapphireEvents.ChannelUpdate> {
	public async run(oldChannel: GuildBasedChannel, channel: GuildBasedChannel) {
		if (isNullish(channel.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('CHANNEL_UPDATE' || 'CHANNEL_OVERWRITE_UPDATE', channel.guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: channel.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.channelUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, channel.guild, guildSettings?.logChannel, Events.ChannelUpdate, this.serverLog(oldChannel, channel, auditLogExecutor, T));
		}
	}

	private serverLog(oldChannel: GuildBasedChannel, channel: GuildBasedChannel, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(`#${channel.name}`, channel.guild.iconURL() as string)
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: channel.id }))
			.setType(Events.ChannelUpdate);

		// Name changed
		if (oldChannel.name !== channel.name) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.NameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
				before: oldChannel.name, after: channel.name
			}));
		}

		// Moved to different category
		if (oldChannel.parent !== channel.parent) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.ParentChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, {
				before: oldChannel.parent ? `<#${oldChannel.parentId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None)), after: channel.parent ? `<#${channel.parentId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None))
			}));
		}

		// Channel type changed
		if (oldChannel.type !== channel.type) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.TypeChanged), t(LanguageKeys.Events.Guilds.Logs.TypeFormatted, {
				before: oldChannel.type, after: channel.type
			}));
		}

		// TextChannel only
		if (oldChannel.type === 'GUILD_TEXT' && channel.type === 'GUILD_TEXT') {
			// Slowmode interval changed
			if (oldChannel.rateLimitPerUser !== channel.rateLimitPerUser) {
				embed.addField(t(LanguageKeys.Events.Guilds.Logs.SlowmodeChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
					before: t(LanguageKeys.Globals.DurationValue, { value: seconds(oldChannel.rateLimitPerUser) }), after: t(LanguageKeys.Globals.DurationValue, { value: seconds(channel.rateLimitPerUser) })
				}));
			}
		}

		// TextChannel & NewsChannel only
		if ((oldChannel.type === 'GUILD_NEWS' || oldChannel.type === 'GUILD_TEXT') && (channel.type === 'GUILD_NEWS' || channel.type === 'GUILD_TEXT')) {
			// Topic changed
			if (oldChannel.topic !== channel.topic) {
				embed.addField(t(LanguageKeys.Events.Guilds.Logs.TopicChanged),
					(oldChannel.topic?.length as number < 64 && channel.topic?.length as number < 64) ?
						t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldChannel.topic, after: channel.topic }) :
						t(LanguageKeys.Events.Guilds.Logs.ChangeLongText, {
							before: oldChannel.topic?.length ? cutText(oldChannel.topic as string, 496) : t(LanguageKeys.Globals.None),
							after: channel.topic?.length ? cutText(channel.topic as string, 496) : t(LanguageKeys.Globals.None)
						})
				);
			}
			// Automatic thread archival duration changed
			if (oldChannel.defaultAutoArchiveDuration !== channel.defaultAutoArchiveDuration) {
				embed.addField(t(LanguageKeys.Events.Guilds.Logs.DefaultAutoArchiveThreadDuration), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
					before: t(LanguageKeys.Globals.DurationValue, { value: minutes(oldChannel.defaultAutoArchiveDuration as number) }), after: t(LanguageKeys.Globals.DurationValue, { value: minutes(channel.defaultAutoArchiveDuration as number) })
				}));
			}
		}

		// TextChannel, NewsChannel, and StoreChannel only
		if ((oldChannel.type === 'GUILD_NEWS' || oldChannel.type === 'GUILD_STORE' || oldChannel.type === 'GUILD_TEXT') &&
			(channel.type === 'GUILD_NEWS' || channel.type === 'GUILD_STORE' || channel.type === 'GUILD_TEXT')) {
			// NSFW toggled
			if (oldChannel.nsfw !== channel.nsfw) {
				embed.addField(t(LanguageKeys.Events.Guilds.Logs.NSFWToggled), channel.nsfw ? Emojis.Check : Emojis.X);
			}
		}

		// VoiceChannel only
		if (oldChannel.type === 'GUILD_VOICE' && channel.type === 'GUILD_VOICE') {
			// User limit changed
			if (oldChannel.userLimit !== channel.userLimit) {
				embed.addField(t(LanguageKeys.Events.Guilds.Logs.UserLimitChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
					before: oldChannel.userLimit === 0 ?
						`${t(LanguageKeys.Miscellaneous.Unlimited)}` :
						t(LanguageKeys.Events.Guilds.Logs.UserLimitFormatted, { count: oldChannel.userLimit }),
					after: channel.userLimit === 0 ?
						`${t(LanguageKeys.Miscellaneous.Unlimited)}` :
						t(LanguageKeys.Events.Guilds.Logs.UserLimitFormatted, { count: channel.userLimit })
				}));
			}
		}

		// VoiceChannel and StageChannel only
		if ((oldChannel.type === 'GUILD_STAGE_VOICE' || oldChannel.type === 'GUILD_VOICE') && (channel.type === 'GUILD_STAGE_VOICE' || channel.type === 'GUILD_VOICE')) {
			// Bitrate changed
			if (oldChannel.bitrate !== channel.bitrate) {
				embed.addField(t(LanguageKeys.Events.Guilds.Logs.BitrateChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: `${oldChannel.bitrate / 1000}kbps`, after: `${channel.bitrate / 1000}kbps` }));
			}
			// Region override changed
			if (oldChannel.rtcRegion !== channel.rtcRegion) {
				embed.addField(t(LanguageKeys.Events.Guilds.Logs.RegionOverrideChanged), t(LanguageKeys.Events.Guilds.Logs.RegionOverrideFormatted, {
					before: isNullish(oldChannel.rtcRegion) ? inlineCodeBlock(t(LanguageKeys.Miscellaneous.Automatic)) : oldChannel.rtcRegion, after: isNullish(channel.rtcRegion) ? inlineCodeBlock(t(LanguageKeys.Miscellaneous.Automatic)) : channel.rtcRegion
				}));
			}
		}

		// Set various author and footer fields depending on channel type, defaulting to standard text channel
		switch (oldChannel.type) {
			case 'GUILD_CATEGORY':
				embed.setAuthor(channel.name, channel.guild.iconURL() as string);
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.CategoryUpdated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_NEWS':
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.NewsChannelUpdated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_STAGE_VOICE':
				embed.setAuthor(channel.name, channel.guild.iconURL() as string);
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.StageChannelUpdated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_STORE':
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.StoreChannelUpdated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			case 'GUILD_VOICE':
				embed.setAuthor(channel.name, channel.guild.iconURL() as string);
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.VoiceChannelUpdated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
				break;
			default:
				embed.setFooter(t(LanguageKeys.Events.Guilds.Logs.ChannelUpdated, {
					by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined
				}), executor?.displayAvatarURL() ?? undefined);
		}

		if (!embed.fields.length) return;

		return embed;
	}
}
