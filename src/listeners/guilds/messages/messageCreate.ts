import { initializeMember } from '#utils/functions/initialize';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.MessageCreate })
export class UserEvent extends Listener {
	public async run(message: Message) {
		if (isNullish(message.author.id)) return;
		if (message.author.bot) return;

		if (message.guild) {
			let memberData = await this.container.prisma.member.findFirst({ where: { userID: message.author.id, guildID: message.guild.id } });
			if (!memberData) {
				await initializeMember(message.author, message.guild);
				memberData = await this.container.prisma.member.findFirst({ where: { userID: message.author.id, guildID: message.guild.id } });
			}
		}


	}
}
