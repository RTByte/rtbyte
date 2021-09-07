import { OWNERS } from '#root/config';
import { Precondition } from '@sapphire/framework';
import { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message) {
		return OWNERS.includes(message.author.id) ? this.ok() : this.error({ context: { silent: true } });
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		Developer: never;
	}
}
