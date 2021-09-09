import { floatPromise, resolveOnErrorCodes, seconds } from "#utils/common";
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { Message, MessageOptions } from "discord.js";
import { setTimeout as sleep } from 'timers/promises';

async function deleteMessageImmediately(message: Message): Promise<Message> {
	return (await resolveOnErrorCodes(message.delete(), RESTJSONErrorCodes.UnknownMessage)) ?? message;
}

/**
 * Deletes a message, skipping if it was already deleted, and aborting if a non-zero timer was set and the message was
 * either deleted or edited.
 *
 * This also ignores the `UnknownMessage` error code.
 * @param message The message to delete.
 * @param time The amount of time, defaults to 0.
 * @returns The deleted message.
 */
 export async function deleteMessage(message: Message, time = 0): Promise<Message> {
	if (message.deleted) return message;
	if (time === 0) return deleteMessageImmediately(message);

	const lastEditedTimestamp = message.editedTimestamp;
	await sleep(time);

	// If it was deleted or edited, cancel:
	if (message.deleted || message.editedTimestamp !== lastEditedTimestamp) {
		return message;
	}

	return deleteMessageImmediately(message);
}

/**
 * Sends a temporary editable message and then floats a {@link deleteMessage} with the given `timer`.
 * @param message The message to reply to.
 * @param options The options to be sent to the channel.
 * @param timer The timer in which the message should be deleted, using {@link deleteMessage}.
 * @returns The response message.
 */
export async function sendTemporaryMessage(message: Message, options: string | MessageOptions, timer = seconds(30)): Promise<Message> {
	if (typeof options === 'string') options = { content: options };

	const response = (await message.reply(options)) as Message;
	floatPromise(deleteMessage(response, timer));
	return response;
}
