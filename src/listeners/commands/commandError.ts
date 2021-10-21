/**
 * @license Apache License 2.0
 * @copyright 2019 Skyra Project
 * Modified for use in this project.
 */

import { LanguageKeys } from '#lib/i18n/languageKeys';
import { translate } from '#lib/i18n/translate';
import type { RTByteCommand } from '#lib/structures';
import { OWNERS } from '#root/config';
import { O } from '#utils/constants';
import { sendTemporaryMessage } from '#utils/functions';
import { Args, ArgumentError, CommandErrorPayload, Events, Listener, UserError } from '@sapphire/framework';
import { codeBlock, cutText } from '@sapphire/utilities';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { DiscordAPIError, HTTPError, Message } from 'discord.js';
import type { TFunction } from 'i18next';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export class UserListener extends Listener<typeof Events.CommandError> {

	public async run(error: Error, { message, piece, args }: CommandErrorPayload) {
		// If the error was a string or an UserError, send it to the user:
		if (typeof error === 'string') return this.stringError(message, args.t, error);
		if (error instanceof ArgumentError) return this.argumentError(message, args.t, error);
		if (error instanceof UserError) return this.userError(message, args.t, error);

		const { client, logger } = this.container;
		// If the error was an AbortError or an Internal Server Error, tell the user to re-try:
		if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
			logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
			return sendTemporaryMessage(message, args.t(LanguageKeys.System.DiscordAbortError));
		}

		// Extract useful information about the DiscordAPIError
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (this.isSilencedError(args, error)) return;
			client.emit(Events.Error, error);
		} else {
			logger.warn(`${this.getWarnError(message)} (${message.author.id}) | ${error.constructor.name}`);
		}

		// Send a detailed message:
		const command = piece as RTByteCommand;

		// Emit where the error was emitted
		logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack || error.message}`);
		try {
			await sendTemporaryMessage(message, { content: this.generateUnexpectedErrorMessage(args, error) });
		} catch (err) {
			client.emit(Events.Error, err as Error);
		}

		return undefined;
	}

	private isSilencedError(args: Args, error: DiscordAPIError | HTTPError) {
		return (
			// If it's an unknown channel or an unknown message, ignore:
			ignoredCodes.includes(error.code) ||
			// If it's a DM message reply after a block, ignore:
			this.isDirectMessageReplyAfterBlock(args, error)
		);
	}

	private isDirectMessageReplyAfterBlock(args: Args, error: DiscordAPIError | HTTPError) {
		// When sending a message to a user who has blocked the bot, Discord replies with 50007 "Cannot send messages to this user":
		if (error.code !== RESTJSONErrorCodes.CannotSendMessagesToThisUser) return false;

		// If it's not a Direct Message, return false:
		if (args.message.guild !== null) return false;

		// If the query was made to the message's channel, then it was a DM response:
		return error.path === `/channels/${args.message.channel.id}/messages`;
	}

	private generateUnexpectedErrorMessage(args: Args, error: Error) {
		if (OWNERS.includes(args.message.author.id)) return codeBlock('js', error.stack!);

		return undefined;
	}

	private stringError(message: Message, t: TFunction, error: string) {
		return this.alert(message, t(LanguageKeys.Events.Errors.String, { mention: message.author.toString(), message: error }));
	}

	private argumentError(message: Message, t: TFunction, error: ArgumentError<unknown>) {
		const argument = error.argument.name;
		const identifier = translate(error.identifier);
		const parameter = error.parameter.replaceAll('`', '῾');
		return this.alert(message, t(identifier, { ...error, ...(error.context as O), argument, parameter: cutText(parameter, 50) }));
	}

	private userError(message: Message, t: TFunction, error: UserError) {
		// `context: { silent: true }` should make UserError silent:
		// Use cases for this are for example permissions error when running the `eval` command.
		if (Reflect.get(Object(error.context), 'silent')) return;

		const identifier = translate(error.identifier);
		return this.alert(message, t(identifier, error.context as any));
	}

	private alert(message: Message, content: string) {
		return sendTemporaryMessage(message, { content });
	}

	private getWarnError(message: Message) {
		return `ERROR: /${message.guild ? `${message.guild.id}/${message.channel.id}` : `DM/${message.author.id}`}/${message.id}`;
	}
}
