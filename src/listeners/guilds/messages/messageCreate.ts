import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { Message } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.MessageCreate })
export class UserEvent extends Listener {
	public async run(message: Message) {
		if (isNullish(message.author.id)) return;
		if (message.author.bot) return;
		
		const dbMember = await this.container.prisma.member.findFirst({ where: { userId: message.author.id, guildId: message.guild?.id }, include: { user: true } });
		if (!dbMember) this.container.client.emit('initializeMember', message.guild, message.author);
	}
}
