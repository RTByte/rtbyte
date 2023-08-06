import { RTByteEmbed } from "#lib/extensions/RTByteEmbed";
import { Colors } from "#utils/constants";
import { Events } from "@sapphire/framework";

export class GuildLogEmbed extends RTByteEmbed {
	public setType(type: string) {
		switch(type) {
			case Events.AutoModerationRuleCreate:
			case Events.ChannelCreate:
			case Events.GuildEmojiCreate:
			case Events.GuildMemberAdd:
			case Events.GuildMembersChunk:
			case Events.GuildRoleCreate:
			case Events.GuildScheduledEventCreate:
			case Events.GuildScheduledEventUserAdd:
			case Events.GuildStickerCreate:
			case Events.InviteCreate:
			case Events.StageInstanceCreate:
			case Events.ThreadCreate:
				this.setColor(Colors.Green);
				break;
			case Events.AutoModerationRuleDelete:
			case Events.ChannelDelete:
			case Events.GuildEmojiDelete:
			case Events.GuildMemberRemove:
			case Events.GuildRoleDelete:
			case Events.GuildScheduledEventDelete:
			case Events.GuildScheduledEventUserRemove:
			case Events.GuildStickerDelete:
			case Events.InviteDelete:
			case Events.MessageBulkDelete:
			case Events.MessageDelete:
			case Events.MessageReactionRemoveAll:
			case Events.MessageReactionRemoveEmoji:
			case Events.StageInstanceDelete:
			case Events.ThreadDelete:
				this.setColor(Colors.Red);
				break;
			case Events.AutoModerationRuleUpdate:
			case Events.ChannelUpdate:
			case Events.GuildEmojiUpdate:
			case Events.GuildMemberUpdate:
			case Events.GuildRoleUpdate:
			case Events.GuildScheduledEventUpdate:
			case Events.GuildStickerUpdate:
			case Events.GuildUpdate:
			case Events.MessageUpdate:
			case Events.StageInstanceUpdate:
			case Events.ThreadUpdate:
				this.setColor(Colors.Yellow);
				break;
		}

		return this;
	}
}