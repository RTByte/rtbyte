import { initializeUser } from '#utils/functions/initialize';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import type { BaseInteraction } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.InteractionCreate })
export class UserEvent extends Listener {
	public async run(interaction: BaseInteraction) {
		const dbMember = await this.container.prisma.userSettings.findFirst({ where: { id: interaction.user.id } });
		if (!dbMember) await initializeUser(interaction.user);
	}
}
