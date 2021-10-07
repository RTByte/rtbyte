/*
Sections of the code in this file is licensed under the Apache License,
Version 2.0 (the "License"); with the original authors being part of the
Skyra Project (https://github.com/skyra-project/skyra) team.

Some of these sections of code have been adapted or altered
for usage in this project.
*/

import type { GuildMessage } from '#lib/types';
import { isModerator } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, Identifiers, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<Precondition.Options>({ position: 10 })
export class UserPrecondition extends Precondition {
	public run(message: Message, command: Command, context: Precondition.Context): Precondition.Result {
		return message.guild ? this.runGuild(message as GuildMessage, command, context) : this.runDM(command, context);
	}

	private runDM(command: Command, context: Precondition.Context): Precondition.Result {
		return command.enabled ? this.ok() : this.error({ identifier: Identifiers.CommandDisabled, context });
	}

	private async runGuild(message: GuildMessage, command: Command, context: Precondition.Context): Precondition.AsyncResult {
		const guildSettings = await this.container.client.prisma.guildSettings.findFirst({ where: { guildID: message.guild.id } });
		const disabled = guildSettings?.disabledCommands.includes(command.name);

		if (disabled) {
			const canOverride = await isModerator(message.member);
			if (!canOverride) return this.error({ context: { ...context, silent: true } });
		}

		return this.runDM(command, context);
	}
}
