/*
Sections of the code in this file is licensed under the Apache License,
Version 2.0 (the "License"); with the original authors being part of the
Skyra Project (https://github.com/skyra-project/skyra) team.

Some of these sections of code have been adapted or altered
for usage in this project.
*/

import { CustomGet } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { OWNERS } from '#root/config';
import { seconds } from '#utils/common';
import { CommandContext, PieceContext, PreconditionContainerArray } from '@sapphire/framework';
import { fetchT } from '@sapphire/plugin-i18next';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import * as Lexure from 'lexure';
import { RTByteArgs } from './parsers/RTByteArgs';

export abstract class RTByteCommand extends SubCommandPluginCommand<RTByteCommand.Args, RTByteCommand> {
	public readonly permissionLevel: PermissionLevels;
	public readonly description: CustomGet<string, string>;

	public constructor(context: PieceContext, options: RTByteCommand.Options) {
		super(context, { cooldownDelay: seconds(5), cooldownLimit: 2, cooldownFilteredUsers: OWNERS, generateDashLessAliases: true, ...options });

		this.permissionLevel = options.permissionLevel ?? PermissionLevels.Everyone;
		this.description = options.description;
	}

	/**
	 * The pre-parse method. This method can be overridden by plugins to define their own argument parser.
	 * @param message The message that triggered the command.
	 * @param parameters The raw parameters as a single string.
	 * @param context The command-context used in this execution.
	 */
	 public async preParse(message: Message, parameters: string, context: CommandContext): Promise<RTByteCommand.Args> {
		const parser = new Lexure.Parser(this.lexer.setInput(parameters).lex()).setUnorderedStrategy(this.strategy);
		const args = new Lexure.Args(parser.parse());
		return new RTByteArgs(message, this, args, context, await fetchT(message));
	}

	protected parseConstructorPreConditions(options: RTByteCommand.Options): void {
		super.parseConstructorPreConditions(options);
		this.parseConstructorPreConditionsPermissionLevel(options);
	}

	protected parseConstructorPreConditionsPermissionLevel(options: RTByteCommand.Options): void {
		if (options.permissionLevel === PermissionLevels.Developer) {
			this.preconditions.append('Developer');
			return;
		}

		const container = new PreconditionContainerArray(['Developer'], this.preconditions);
		switch (options.permissionLevel ?? PermissionLevels.Everyone) {
			case PermissionLevels.Everyone:
				container.append('Everyone');
				break;
			case PermissionLevels.Moderator:
				container.append('Moderator');
				break;
			case PermissionLevels.Administrator:
				container.append('Administrator');
				break;
			case PermissionLevels.ServerOwner:
				container.append('ServerOwner');
				break;
			default:
				throw new Error(
					`RTByteCommand[${this.name}]: "permissionLevel" was specified as an invalid permission level (${options.permissionLevel}).`
				);
		}

		this.preconditions.append(container);
	}
}

export namespace RTByteCommand {
	export type Options = SubCommandPluginCommand.Options & {
		description: CustomGet<string, string>;
		permissionLevel?: number
	}

	export type Args = RTByteArgs;
	export type Context = CommandContext;
}
