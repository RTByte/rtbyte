import { LanguageKeys } from "#lib/i18n/languageKeys";
import { GuildLogEmbed } from "#lib/structures";
import { Events } from "#lib/types/Enums";
import { Emojis } from "#utils/constants";
import { ApplyOptions } from "@sapphire/decorators";
import { Events as SapphireEvents, Listener, ListenerOptions } from "@sapphire/framework";
import { inlineCodeBlock, isNullish } from "@sapphire/utilities";
import { Invite, User } from "discord.js";
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({ event: Events.InviteCreate })
export class UserListener extends Listener<typeof SapphireEvents.InviteCreate> {
	public async run(invite: Invite) {
		if (isNullish(invite.guild)) return;

		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: invite.guild.id } })
		const T = this.container.i18n.getT(guildSettings?.language as string)

		if (guildSettings?.logChannel && guildSettings.inviteCreateLog) {
			this.container.client.emit(Events.GuildMessageLog, invite.guild, guildSettings?.logChannel, Events.InviteCreate, this.serverLog(invite, invite.inviter, T));
		}
	}

	private serverLog(invite: Invite, executor: User | null, t: TFunction) {
		const embed = new GuildLogEmbed()
			.setAuthor(invite.code, invite.guild?.iconURL() as string)
			.setDescription(`${t(LanguageKeys.Miscellaneous.Link)}: \`https://discord.gg/${invite.code}\``)
			.setFooter(t(LanguageKeys.Events.Guilds.Logs.InviteCreated, { by: executor ? t(LanguageKeys.Miscellaneous.By, { user: executor?.tag }) : undefined }), executor?.displayAvatarURL() ?? undefined)
			.setType(Events.InviteCreate);

		// Set non-guaranteed channel field
		if (invite.channel) {
			let langKey: string;
			switch (invite.channel.type) {
				case 'GUILD_NEWS':
					langKey = t(LanguageKeys.Miscellaneous.NewsChannel);
					break;
				case 'GUILD_STAGE_VOICE':
					langKey = t(LanguageKeys.Miscellaneous.StageChannel);
					break;
				case 'GUILD_STORE':
					langKey = t(LanguageKeys.Miscellaneous.StoreChannel);
					break;
				case 'GUILD_VOICE':
					langKey = t(LanguageKeys.Miscellaneous.VoiceChannel);
					break;
				default:
					langKey = t(LanguageKeys.Miscellaneous.Channel);
			}

			embed.addField(langKey, `<#${invite.channel.id}>`, true);
		}

		// Set non-guaranteed expiry field
		if (invite.expiresTimestamp) {
			const expiryOffset = Date.now() - invite.expiresTimestamp;
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.Expiry), inlineCodeBlock(t(LanguageKeys.Globals.DurationValueFuture, { value: expiryOffset }).replace('-', '')), true);
		}

		// Set non-guaranteed max-use field
		if (invite.maxUses) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.MaxUses), inlineCodeBlock(String(invite.maxUses)), true);
		}

		// Set non-guaranteed temporary membership field
		if (invite.temporary) {
			embed.addField(t(LanguageKeys.Events.Guilds.Logs.Temporary), Emojis.Check);
		}

		return embed;
	}
}
