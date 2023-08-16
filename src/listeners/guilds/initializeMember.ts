/*

Temporarily disabing this listener while I evaluate whether it's redundant now that we have #util/functions/initialize/initializeMember()

import { ApplyOptions } from '@sapphire/decorators';
import { Listener, type ListenerOptions } from '@sapphire/framework';
import { bold, gray } from 'colorette';
import { Guild, User } from 'discord.js';

@ApplyOptions<ListenerOptions>({ event: 'initializeMember' })
export class UserEvent extends Listener {
	public async run(guild: Guild, user: User) {
		this.container.logger.info(`Initializing member ${bold(user.username)} (${gray(user.id)}) for ${bold(guild.name)} (${gray(guild.id)})...`);

		await this.container.prisma.member.create({
			data: {
				guild: {
					connect: {
						id: guild.id
					}
				},
				user: {
					connectOrCreate: {
						where: { id: user.id },
						create: { 
							id: user.id,
							previousUsernames: user.username
						}
					}
				}
			},
			include: { user: true }
		}).catch(e => {
			this.container.logger.error(`Failed to initialize member ${bold(user.username)} (${gray(user.id)}) for ${bold(guild.name)} (${gray(guild.id)}), error below.`);
			return this.container.logger.error(e);
		});

		return this.container.logger.info(`Verified initialization of member ${bold(user.username)} (${gray(user.id)}) for ${bold(guild.name)} (${gray(guild.id)})`);
	}
}
*/