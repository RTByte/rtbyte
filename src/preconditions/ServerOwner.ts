import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Precondition } from '@sapphire/framework';
import { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		return message.author.id === message.guild!.ownerId ? this.ok() : this.error({ identifier: LanguageKeys.Preconditions.ServerOwner });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		ServerOwner: never;
	}
}
