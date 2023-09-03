import { initializeMember } from '#utils/functions/initialize';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { GuildMember } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: Events.GuildMemberUpdate })
export class UserEvent extends Listener {
	public async run(oldMember: GuildMember, member: GuildMember) {
		if (isNullish(member.id)) return;
		if (member.user.bot) return;

		let memberData = await this.container.prisma.member.findFirst({ where: { userID: member.id, guildID: member.guild.id } });
		if (!memberData) {
			await initializeMember(member.user, member.guild);
			memberData = await this.container.prisma.member.findFirst({ where: { userID: member.id, guildID: member.guild.id } });
		}

		const usernameHistory = memberData?.usernameHistory;
		const displayNameHistory = memberData?.displayNameHistory;

		if (oldMember.user.username !== member.user.username) usernameHistory?.push(oldMember.user.username);
		if (oldMember.displayName !== member.displayName) displayNameHistory?.push(oldMember.displayName);

		await this.container.prisma.member.update({ where: { id: memberData?.id }, data: { usernameHistory, displayNameHistory } });
	}
}
