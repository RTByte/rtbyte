import { Events } from '#lib/types/Enums';
import { Colors } from '#utils/constants';
import { MessageEmbed } from 'discord.js';

export class GuildLogEmbed extends MessageEmbed {
	public constructor() {
		super();
		this.setTimestamp();
	}

	public setType(type: string) {
		switch (type) {
			case Events.ChannelCreate:
			case Events.EmojiCreate:
			case Events.GuildBotAdd:
			case Events.GuildMemberAdd:
			case Events.GuildWebhookCreate:
			case Events.InviteCreate:
			case Events.RoleCreate:
			case Events.StageInstanceCreate:
			case Events.StickerCreate:
			case Events.ThreadCreate:
				this.setColor(Colors.Green);
				break;
			case Events.ChannelDelete:
			case Events.EmojiDelete:
			case Events.GuildMemberRemove:
			case Events.GuildWebhookDelete:
			case Events.InviteDelete:
			case Events.RoleDelete:
			case Events.StageInstanceDelete:
			case Events.StickerDelete:
			case Events.ThreadDelete:
				this.setColor(Colors.Red);
				break;
			case Events.ChannelUpdate:
			case Events.EmojiUpdate:
			case Events.GuildMemberUpdate:
			case Events.GuildWebhookUpdate:
			case Events.GuildUpdate:
			case Events.RoleUpdate:
			case Events.StageInstanceUpdate:
			case Events.StickerUpdate:
			case Events.ThreadUpdate:
				this.setColor(Colors.Blue);
				break;
			case Events.MessageDelete:
			case Events.MessageUpdate:
				this.setColor(Colors.LightBlue);
				break;
			default:
				this.setColor(Colors.White);
		}

		return this;
	}
}
