import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberUpdate })
export class UserEvent extends Listener {
	public async run(oldMember: GuildMember, member: GuildMember) {
		if (isNullish(member.id)) return;
		if (member.user.bot) return;
		
		const dbMember = await this.container.prisma.member.findFirst({ where: { userId: member.id, guildId: member.guild.id }, include: { user: true } });
		if (!dbMember) this.container.client.emit('initializeMember', member.guild, member.user);

		const previousUsernames = dbMember?.user.previousUsernames;
		if (!previousUsernames?.length) return;
		if (!previousUsernames.includes(oldMember.user.username)) {
			previousUsernames.push(oldMember.user.username);
			await this.container.prisma.user.update({
				where: { id: member.user.id },
				data: { previousUsernames }
			});
		}
		if (!previousUsernames.includes(member.user.username)) {
			previousUsernames.push(member.user.username);
			await this.container.prisma.user.update({
				where: { id: member.user.id },
				data: { previousUsernames }
			});
		}
	}
}
