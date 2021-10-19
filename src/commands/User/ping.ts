import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RTByteCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { reply } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<RTByteCommand.Options>({
	aliases: ['pong'],
	description: LanguageKeys.Commands.User.PingDescription
})
export class UserCommand extends RTByteCommand {
	public async messageRun(message: Message, args: RTByteCommand.Args) {
		const msg = await reply(message, args.t(LanguageKeys.Commands.User.Ping));

		const content = args.t(LanguageKeys.Commands.User.PingPong, {
			diff: (msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp),
			ping: Math.round(this.container.client.ws.ping)
		});
		return reply(message, content);
	}
}
