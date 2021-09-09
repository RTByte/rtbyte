import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isModerator } from '#utils/functions';
import { Precondition } from '@sapphire/framework';
import { GuildMember, Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		return (await isModerator(message.member as GuildMember)) ? this.ok() : this.error({ identifier: LanguageKeys.Preconditions.Moderator });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		Moderator: never;
	}
}
