import { LanguageKeys } from '#lib/i18n/languageKeys';
import { isAdmin } from '#utils/functions';
import { Precondition } from '@sapphire/framework';
import { GuildMember, Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		return (await isAdmin(message.member as GuildMember)) ? this.ok() : this.error({ identifier: LanguageKeys.Preconditions.Administrator });
	}
}
