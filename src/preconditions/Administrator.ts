import { isAdmin } from '#utils/functions';
import { Precondition } from '@sapphire/framework';
import { GuildMember, Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		return (await isAdmin(message.member as GuildMember)) ? this.ok() : this.error({ identifier: "you ain't an admin" /* identifier: LanguageKeys.Preconditions.Moderator */ });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		Administrator: never;
	}
}
