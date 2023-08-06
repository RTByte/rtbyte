import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import type { BaseInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.InteractionCreate })
export class UserEvent extends Listener {
	public async run(interaction: BaseInteraction) {
		const dbMember = await this.container.prisma.member.findFirst({ where: { userId: interaction.user.id, guildId: interaction.guild?.id }, include: { user: true } });
		if (!dbMember) this.container.client.emit('initializeMember', interaction.guild, interaction.user);
	}
}
