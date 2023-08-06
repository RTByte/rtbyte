import { container } from "@sapphire/framework";
import { inlineCodeBlock } from "@sapphire/utilities";
import { PermissionFlagsBits, StageChannel, VoiceChannel, type AuditLogEvent, type Guild, type Message } from "discord.js";

/**
 * Get the executor user from the last audit log entry of specific type
 * @param action The audit log type to fetch
 * @param guild The Guild object to get audit logs for
 * @returns Executor User object from the last audit log entry of specific type.
 */
export async function getAuditLogExecutor(action: AuditLogEvent, guild: Guild) {
	if (!guild.members.cache.get(container.client.user!.id)?.permissions.has(PermissionFlagsBits.ViewAuditLog)) return;

	return (await guild.fetchAuditLogs({ type: action })).entries.first()?.executor;
}

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
 * Get the content from a message.
 * @param channel The Stage or Voice channel to get the region override from
 */
export function getRegionOverride(channel: StageChannel | VoiceChannel) {
	switch (channel.rtcRegion) {
		case 'brazil':
			return `🇧🇷 ${inlineCodeBlock(`Brazil`)}`
		case 'hongkong':
			return `🇭🇰 ${inlineCodeBlock(`Hong Kong`)}`
		case 'india':
			return `🇮🇳 ${inlineCodeBlock(`India`)}`
		case 'japan':
			return `🇯🇵 ${inlineCodeBlock(`Japan`)}`
		case 'rotterdam':
			return `🇳🇱 ${inlineCodeBlock(`Rotterdam`)}`
		case 'russia':
			return `🇷🇺 ${inlineCodeBlock(`Russia`)}`
		case 'singapore':
			return `🇸🇬 ${inlineCodeBlock(`Singapore`)}`
		case 'southafrica':
			return `🇿🇦 ${inlineCodeBlock(`South Africa`)}`
		case 'sydney':
			return `🇦🇺 ${inlineCodeBlock(`Sydney`)}`
		case 'us-cental':
			return `🇺🇸 ${inlineCodeBlock(`US Central`)}`
		case 'us-east':
			return `🇺🇸 ${inlineCodeBlock(`US East`)}`
		case 'us-south':
			return `🇺🇸 ${inlineCodeBlock(`US South`)}`
		case 'us-west':
			return `🇺🇸 ${inlineCodeBlock(`US West`)}`
		default:
			return `🗺️ ${inlineCodeBlock(`Automatic`)}`
	}
}

/**
 * Get the content from a message.
 * @param permission The permission to get the string for
 */
export function getPermissionString(permission: string) {
	switch (permission) {
		case 'ViewChannel': return inlineCodeBlock('View channels');
		case 'ManageChannels': return inlineCodeBlock('Manage channels');
		case 'ManageRoles': return inlineCodeBlock('Manage roles');
		case 'ManageGuildExpressions': return inlineCodeBlock('Manage expressions');
		case 'ViewAuditLog': return inlineCodeBlock('View audit log');
		case 'ViewGuildInsights': return inlineCodeBlock('View server insights');
		case 'ManageWebhooks': return inlineCodeBlock('Manage webhooks');
		case 'ManageGuild': return inlineCodeBlock('Manage server');
		case 'CreateInstantInvite': return inlineCodeBlock('Create invite');
		case 'ChangeNickname': return inlineCodeBlock('Change nickname');
		case 'ManageNicknames': return inlineCodeBlock('Manage nicknames');
		case 'KickMembers': return inlineCodeBlock('Kick members');
		case 'BanMembers': return inlineCodeBlock('Ban members');
		case 'ModerateMembers': return inlineCodeBlock('Timeout members');
		case 'SendMessages': return inlineCodeBlock('Send messages');
		case 'SendMessagesInThreads': return inlineCodeBlock('Send messages in threads');
		case 'CreatePublicThreads': return inlineCodeBlock('Create public threads');
		case 'CreatePrivateThreads': return inlineCodeBlock('Create private threads');
		case 'EmbedLinks': return inlineCodeBlock('Embed links');
		case 'AttachFiles': return inlineCodeBlock('Attach files');
		case 'AddReactions': return inlineCodeBlock('Add reactions');
		case 'UseExternalEmojis': return inlineCodeBlock('Use external emoji');
		case 'UseExternalStickers': return inlineCodeBlock('User external stickers');
		case 'MentionEveryone': return inlineCodeBlock('Mention @everyone, @here, and all roles');
		case 'ManageMessages': return inlineCodeBlock('Manage messages');
		case 'ManageThreads': return inlineCodeBlock('Manage threads');
		case 'ReadMessageHistory': return inlineCodeBlock('Read message history');
		case 'SendTTSMessages': return inlineCodeBlock('Send text-to-speech messages');
		case 'UseApplicationCommands': return inlineCodeBlock('Use application commands');
		case 'SendVoiceMessages': return inlineCodeBlock('Send voice messages');
		case 'Connect': return inlineCodeBlock('Connect');
		case 'Speak': return inlineCodeBlock('Speak');
		case 'Stream': return inlineCodeBlock('Video');
		case 'UseEmbeddedActivities': return inlineCodeBlock('Use activities');
		case 'UseSoundboard': return inlineCodeBlock('Use soundboard');
		case 'UseExternalSounds': return inlineCodeBlock('Use external sounds');
		case 'UseVAD': return inlineCodeBlock('Use voice activity');
		case 'PrioritySpeaker': return inlineCodeBlock('Priority speaker');
		case 'MuteMembers': return inlineCodeBlock('Mute members');
		case 'DeafenMembers': return inlineCodeBlock('Deafen members');
		case 'MoveMembers': return inlineCodeBlock('Move members');
		case 'RequestToSpeak': return inlineCodeBlock('Request to speak');
		case 'ManageEvents': return inlineCodeBlock('Manage events');
		case 'Administrator': return inlineCodeBlock('Administrator');
		default: return undefined;
	}
}