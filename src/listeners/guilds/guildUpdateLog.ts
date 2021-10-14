import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { seconds } from "#utils/common";
import { Emojis } from "#utils/constants";
import { getAuditLogExecutor } from "#utils/util";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { inlineCodeBlock, isNullish } from "@sapphire/utilities";
import { Guild, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.GuildUpdate })
export class UserListener extends Listener<typeof SapphireEvents.GuildUpdate> {
	public async run(oldGuild: Guild, guild: Guild) {
		if (isNullish(guild.id)) return;

		const auditLogExecutor = await getAuditLogExecutor('GUILD_UPDATE', guild);
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.guildUpdateLog) {
			this.container.client.emit(Events.GuildMessageLog, guild, guildSettings?.logChannel, Events.GuildUpdate, this.serverLog(oldGuild, guild, auditLogExecutor, T));
		}
	}

	private async serverLog(oldGuild: Guild, guild: Guild, executor: User | null | undefined, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(guild.name, guild.iconURL() as string)
			.setDescription(t(LanguageKeys.Miscellaneous.DisplayID, { id: guild.id }))
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.GuildUpdated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.GuildUpdate);

		// Name changed
		if (oldGuild.name !== guild.name) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.NameChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, { before: oldGuild.name, after: guild.name }));
		}

		// Icon changed
		if (oldGuild.icon !== guild.icon) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.GuildIconChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeLongText, { before: oldGuild.iconURL(), after: guild.iconURL() }));
		}

		// AFK channel changed
		if (oldGuild.afkChannel !== guild.afkChannel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.AfkChannelChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, {
				before: oldGuild.afkChannel ? `<#${oldGuild.afkChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None)),
				after: guild.afkChannel ? `<#${guild.afkChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None))
			}));
		}

		// AFK timeout changed
		if (oldGuild.afkTimeout !== guild.afkTimeout) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.AfkTimeoutChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
				before: t(LanguageKeys.Globals.DurationValue, { value: seconds(oldGuild.afkTimeout) }),
				after: t(LanguageKeys.Globals.DurationValue, { value: seconds(guild.afkTimeout) })
			}));
		}

		// Invite splash changed
		if (oldGuild.splash !== guild.splash) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SplashChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeLongText, {
				before: oldGuild.splash ? oldGuild.splashURL({ format: 'png' }) : t(LanguageKeys.Globals.None),
				after: guild.splash ? guild.splashURL({ format: 'png' }) : t(LanguageKeys.Globals.None)
			}));
			embed.setImage(guild.splashURL({ size: 256 }) as string);
		}

		// Banner changed
		if (oldGuild.banner !== guild.banner) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.BannerChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeLongText, {
				before: oldGuild.banner ? oldGuild.bannerURL({ format: 'png' }) : t(LanguageKeys.Globals.None),
				after: guild.banner ? guild.bannerURL({ format: 'png' }) : t(LanguageKeys.Globals.None)
			}));
			embed.setImage(guild.bannerURL({ size: 256 }) as string);
		}

		// Default message notifications changed
		if (oldGuild.defaultMessageNotifications !== guild.defaultMessageNotifications) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.DefaultMessageNotificationsChanged), t(LanguageKeys.Events.Guilds.Logs.DefaultMessageNotificationsFormatted, {
				before: oldGuild.defaultMessageNotifications,
				after: guild.defaultMessageNotifications
			}));
		}

		// Discovery splash changed
		if (oldGuild.discoverySplash !== guild.discoverySplash) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.DiscoverySplashChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeLongText, {
				before: oldGuild.discoverySplash ? oldGuild.discoverySplashURL({ format: 'png' }) : t(LanguageKeys.Globals.None),
				after: guild.discoverySplash ? guild.discoverySplashURL({ format: 'png' }) : t(LanguageKeys.Globals.None)
			}));
			embed.setImage(guild.discoverySplashURL({ size: 256 }) as string);
		}

		// Explicit content filter changed
		if (oldGuild.explicitContentFilter !== guild.explicitContentFilter) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.ExplicitContentFilterChanged), t(LanguageKeys.Events.Guilds.Logs.ExplicitContentFilterFormatted, {
				before: oldGuild.explicitContentFilter,
				after: guild.explicitContentFilter
			}));
		}

		// 2FA requirement toggled
		if (oldGuild.mfaLevel !== guild.mfaLevel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.MfaLevelToggled), guild.mfaLevel === 'ELEVATED' ? Emojis.Check : Emojis.X)
		}

		// Ownership transferred
		if (oldGuild.ownerId !== guild.ownerId) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.OwnerChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, { before: `<@${oldGuild.ownerId}>`, after: `<@${guild.ownerId}>` }));
		}

		// Preferred locale changed
		if (oldGuild.preferredLocale !== guild.preferredLocale) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.PreferredLocaleChanged), t(LanguageKeys.Events.Guilds.Logs.PreferredLocaleFormatted, { before: oldGuild.preferredLocale, after: guild.preferredLocale }));
		}

		// Public updates channel changed
		if (oldGuild.publicUpdatesChannel !== guild.publicUpdatesChannel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.PublicUpdatesChannelChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, {
				before: oldGuild.publicUpdatesChannel ? `<#${oldGuild.publicUpdatesChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None)),
				after: guild.publicUpdatesChannel ? `<#${guild.publicUpdatesChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None))
			}));
		}

		// Rules channel changed
		if (oldGuild.rulesChannel !== guild.rulesChannel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.RulesChannelChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, {
				before: oldGuild.rulesChannel ? `<#${oldGuild.rulesChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None)),
				after: guild.rulesChannel ? `<#${guild.rulesChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None))
			}));
		}

		// System channel changed
		if (oldGuild.systemChannel !== guild.systemChannel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, {
				before: oldGuild.systemChannel ? `<#${oldGuild.systemChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None)),
				after: guild.systemChannel ? `<#${guild.systemChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None))
			}));
		}

		// System channel flags changed
		if (oldGuild.systemChannelFlags !== guild.systemChannelFlags) {
			this.systemChannelFlagChecker(oldGuild, guild, embed, t);
		}

		// Vanity URL changed
		if (oldGuild.vanityURLCode !== guild.vanityURLCode) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortText, {
				before: oldGuild.vanityURLCode ?? t(LanguageKeys.Globals.None),
				after: guild.vanityURLCode ?? t(LanguageKeys.Globals.None)
			}));
		}

		// Verification level changed
		if (oldGuild.verificationLevel !== guild.verificationLevel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.VerificationLevelChanged), t(LanguageKeys.Events.Guilds.Logs.VerificationLevelFormatted, {
				before: oldGuild.verificationLevel,
				after: guild.verificationLevel
			}));
		}

		// Widget channel changed
		if (oldGuild.widgetChannel !== guild.widgetChannel) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.WidgetChannelChanged), t(LanguageKeys.Events.Guilds.Logs.ChangeShortObject, {
				before: oldGuild.widgetChannel ? `<#${oldGuild.widgetChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None)),
				after: guild.widgetChannel ? `<#${guild.widgetChannelId}>` : inlineCodeBlock(t(LanguageKeys.Globals.None))
			}));
		}

		// Widget toggled
		if (oldGuild.widgetEnabled !== guild.widgetEnabled) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.WidgetEnabledToggled), guild.widgetEnabled ? Emojis.Check : Emojis.X);
		}

		if (!embed.fields.length) return;

		return embed;
	}

	private systemChannelFlagChecker(oldGuild: Guild, guild: Guild, embed: GuildLogEmbed, t: TFunction) {
		const [allOn, boostHelpOn, welcomeHelpOn, helpOn, welcomeBoostOn, boostOn, welcomeOn, allOff] = [0, 1, 2, 3, 4, 5, 6, 7];

		// All off
		if (oldGuild.systemChannelFlags.bitfield === allOff && guild.systemChannelFlags.bitfield === allOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOff && guild.systemChannelFlags.bitfield === welcomeBoostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOff && guild.systemChannelFlags.bitfield === boostHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOff && guild.systemChannelFlags.bitfield === welcomeHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOff && guild.systemChannelFlags.bitfield === welcomeOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOff && guild.systemChannelFlags.bitfield === boostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOff && guild.systemChannelFlags.bitfield === helpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}

		// All on
		if (oldGuild.systemChannelFlags.bitfield === allOn && guild.systemChannelFlags.bitfield === allOff) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOn && guild.systemChannelFlags.bitfield === welcomeBoostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOn && guild.systemChannelFlags.bitfield === boostHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOn && guild.systemChannelFlags.bitfield === welcomeHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOn && guild.systemChannelFlags.bitfield === helpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOn && guild.systemChannelFlags.bitfield === boostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === allOn && guild.systemChannelFlags.bitfield === welcomeOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}

		// Welcome on
		if (oldGuild.systemChannelFlags.bitfield === welcomeOn && guild.systemChannelFlags.bitfield === allOff) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeOn && guild.systemChannelFlags.bitfield === boostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeOn && guild.systemChannelFlags.bitfield === helpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeOn && guild.systemChannelFlags.bitfield === welcomeBoostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeOn && guild.systemChannelFlags.bitfield === welcomeHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeOn && guild.systemChannelFlags.bitfield === boostHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeOn && guild.systemChannelFlags.bitfield === allOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}

		// Boost on
		if (oldGuild.systemChannelFlags.bitfield === boostOn && guild.systemChannelFlags.bitfield === allOff) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostOn && guild.systemChannelFlags.bitfield === welcomeOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostOn && guild.systemChannelFlags.bitfield === helpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostOn && guild.systemChannelFlags.bitfield === welcomeBoostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostOn && guild.systemChannelFlags.bitfield === welcomeHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostOn && guild.systemChannelFlags.bitfield === boostHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostOn && guild.systemChannelFlags.bitfield === allOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}

		// Help on
		if (oldGuild.systemChannelFlags.bitfield === helpOn && guild.systemChannelFlags.bitfield === allOff) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === helpOn && guild.systemChannelFlags.bitfield === welcomeOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === helpOn && guild.systemChannelFlags.bitfield === boostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === helpOn && guild.systemChannelFlags.bitfield === welcomeBoostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === helpOn && guild.systemChannelFlags.bitfield === welcomeHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === helpOn && guild.systemChannelFlags.bitfield === boostHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === helpOn && guild.systemChannelFlags.bitfield === allOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}

		// Welcome and boost on
		if (oldGuild.systemChannelFlags.bitfield === welcomeBoostOn && guild.systemChannelFlags.bitfield === allOff) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeBoostOn && guild.systemChannelFlags.bitfield === welcomeOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeBoostOn && guild.systemChannelFlags.bitfield === boostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeBoostOn && guild.systemChannelFlags.bitfield === helpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeBoostOn && guild.systemChannelFlags.bitfield === welcomeHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeBoostOn && guild.systemChannelFlags.bitfield === boostHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeBoostOn && guild.systemChannelFlags.bitfield === allOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.Check);
		}

		// Welcome and help on
		if (oldGuild.systemChannelFlags.bitfield === welcomeHelpOn && guild.systemChannelFlags.bitfield === allOff) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeHelpOn && guild.systemChannelFlags.bitfield === welcomeOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeHelpOn && guild.systemChannelFlags.bitfield === boostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeHelpOn && guild.systemChannelFlags.bitfield === helpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeHelpOn && guild.systemChannelFlags.bitfield === welcomeBoostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeHelpOn && guild.systemChannelFlags.bitfield === boostHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}
		if (oldGuild.systemChannelFlags.bitfield === welcomeHelpOn && guild.systemChannelFlags.bitfield === allOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.Check);
		}

		// Boost and help on
		if (oldGuild.systemChannelFlags.bitfield === boostHelpOn && guild.systemChannelFlags.bitfield === allOff) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostHelpOn && guild.systemChannelFlags.bitfield === welcomeOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostHelpOn && guild.systemChannelFlags.bitfield === boostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostHelpOn && guild.systemChannelFlags.bitfield === helpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostHelpOn && guild.systemChannelFlags.bitfield === welcomeBoostOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsHelpToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostHelpOn && guild.systemChannelFlags.bitfield === welcomeHelpOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsBoostToggled), Emojis.X);
		}
		if (oldGuild.systemChannelFlags.bitfield === boostHelpOn && guild.systemChannelFlags.bitfield === allOn) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.SystemChannelFlagsWelcomeToggled), Emojis.Check);
		}
	}
}
