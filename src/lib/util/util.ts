import { RandomLoadingMessage } from '#utils/constants';
import { send } from '@sapphire/plugin-editable-commands';
import { GuildChannel, Message, MessageEmbed, Permissions, ThreadChannel, UserResolvable } from 'discord.js';

/**
 * Image extensions:
 * - bmp
 * - jpg
 * - jpeg
 * - png
 * - gif
 * - webp
 */
 export const IMAGE_EXTENSION = /\.(bmp|jpe?g|png|gif|webp)$/i;

 /**
  * Audio extensions:
  * - wav
  * - mp3
  * - ogg
  */
 export const AUDIO_EXTENSION = /\.(wav|mp3|ogg)$/i;

 /**
  * Video extensions:
  * - gifv
  * - webm
  * - mp4
  */
 export const VIDEO_EXTENSION = /\.(gifv|webm|mp4)$/i;

 /**
  * Media extensions
  * - ...Image extensions
  * - ...Audio extensions
  * - ...Video extensions
  */
export const MEDIA_EXTENSION = /\.(bmp|jpe?g|png|gifv?|web[pm]|wav|mp[34]|ogg)$/i;

/**
 * Get the content from a message.
 * @param message The Message instance to get the content from
 */
 export function getContent(message: Message): string | null {
	if (message.content) return message.content;
	for (const embed of message.embeds) {
		if (embed.description) return embed.description;
		if (embed.fields.length) return embed.fields[0].value;
	}
	return null;
}

/**
 * Gets all the contents from a message.
 * @param message The Message instance to get all contents from
 */
 export function getAllContent(message: Message): string {
	const output: string[] = [];
	if (message.content) output.push(message.content);
	for (const embed of message.embeds) {
		if (embed.author?.name) output.push(embed.author.name);
		if (embed.title) output.push(embed.title);
		if (embed.description) output.push(embed.description);
		for (const field of embed.fields) output.push(`${field.name}\n${field.value}`);
		if (embed.footer?.text) output.push(embed.footer.text);
	}

	return output.join('\n');
}

export interface ImageAttachment {
	url: string;
	proxyURL: string;
	height: number;
	width: number;
}

/**
 * Get a image attachment from a message.
 * @param message The Message instance to get the image url from
 */
 export function getAttachment(message: Message): ImageAttachment | null {
	if (message.attachments.size) {
		const attachment = message.attachments.find((att) => IMAGE_EXTENSION.test(att.url));
		if (attachment) {
			return {
				url: attachment.url,
				proxyURL: attachment.proxyURL,
				height: attachment.height!,
				width: attachment.width!
			};
		}
	}

	for (const embed of message.embeds) {
		if (embed.type === 'image') {
			return {
				url: embed.thumbnail!.url,
				proxyURL: embed.thumbnail!.proxyURL!,
				height: embed.thumbnail!.height!,
				width: embed.thumbnail!.width!
			};
		}
		if (embed.image) {
			return {
				url: embed.image.url,
				proxyURL: embed.image.proxyURL!,
				height: embed.image.height!,
				width: embed.image.width!
			};
		}
	}

	return null;
}

/**
 * Get the image url from a message.
 * @param message The Message instance to get the image url from
 */
export function getImage(message: Message): string | null {
	const attachment = getAttachment(message);
	return attachment ? attachment.proxyURL || attachment.url : null;
}

/**
 * Picks a random item from an array
 * @param array The array to pick a random item from
 * @example
 * const randomEntry = pickRandom([1, 2, 3, 4]) // 1
 */
export function pickRandom<T>(array: readonly T[]): T {
	const { length } = array;
	return array[Math.floor(Math.random() * length)];
}

/**
 * Sends a loading message to the current channel
 * @param message The message data for which to send the loading message
 */
export function sendLoadingMessage(message: Message): Promise<typeof message> {
	return send(message, { embeds: [new MessageEmbed().setDescription(pickRandom(RandomLoadingMessage)).setColor('#FF0000')] });
}

/**
 * Validates that a user has VIEW_CHANNEL permissions to a channel
 * @param channel The TextChannel to check
 * @param user The user for which to check permission
 * @returns Whether the user has access to the channel
 * @example validateChannelAccess(channel, message.author)
 */
 export function validateChannelAccess(channel: GuildChannel | ThreadChannel, user: UserResolvable) {
	return (channel.guild !== null && channel.permissionsFor(user)?.has(Permissions.FLAGS.VIEW_CHANNEL)) || false;
}
