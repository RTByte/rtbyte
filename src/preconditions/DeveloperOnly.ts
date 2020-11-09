import { OWNERS } from '@root/config';
import { Precondition } from '@sapphire/framework';
import { Message } from 'discord.js';

export default class extends Precondition {

	public async run(msg: Message) {
		return OWNERS.includes(msg.author.id)
			? this.ok()
			: this.error(this.name, await msg.fetchLanguageKey('preconditions/core:DeveloperOnly.error'));
	}

}
