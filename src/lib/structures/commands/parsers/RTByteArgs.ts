import type { RTByteCommand } from '#lib/structures';
import { Args, CommandContext } from '@sapphire/framework';
import type { Message } from 'discord.js';
import type { TFunction } from 'i18next';
import type { Args as LexureArgs } from 'lexure';

export class RTByteArgs extends Args {
	public t: TFunction;

	public constructor(message: Message, command: RTByteCommand, parser: LexureArgs, context: CommandContext, t: TFunction) {
		super(message, command, parser, context);
		this.t = t;
	}
}

declare module '@sapphire/framework' {
	export interface Args {
		t: TFunction;
	}
}
