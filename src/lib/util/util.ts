import { container } from "@sapphire/framework";
import { inlineCodeBlock, isNullishOrEmpty } from "@sapphire/utilities";
import { ChannelType, PermissionFlagsBits, StageChannel, VoiceChannel, type AuditLogEvent, type Collection, type Guild, type GuildBasedChannel, type GuildChannel, type Message } from "discord.js";

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

// These are just here for the sorting function below
const textChannelTypes = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum];
// const voiceChannelTypes = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];

/**
 * Sorts a collection of GuildBasedChannels into the order they'd be displayed in the Discord client
 * @param inputChannels The collection of channels you want to be sorted client-style
 */
export function clientStyleChannelSort(inputChannels: Collection<string, GuildBasedChannel>) {
	// First, make sure we don't have any threads--they don't have position properties
	const allChannels = inputChannels.filter((channel) => channel.type !== ChannelType.PrivateThread && channel.type !== ChannelType.PublicThread);
	// Now that we know we have the right channels, just ignore me constantly reassigning types to them...
	const levelZero = allChannels.clone().filter((channel) => !channel.parentId);
	const levelOne: { parentID: string, children: Collection<string, GuildBasedChannel> }[] = [];

	levelZero.forEach((l0Channel) => {
		// Now we'll build collections of nested channels and group them by their parent
		const l1Channels = allChannels.clone().filter((l1Channel) => l1Channel.parentId === l0Channel.id);
		// Now we'll run our three-way sort on these channels
		// Special Channels (eg: Forums/Stages) can only exist in categories
		// They can also freely mix with their respective types (Forums w/ Text, Stages w/ Voice)
		// So we do a slightly different sort for child channels than for parent/non-nested ones
		l1Channels.sort((a, b) => {
			const chA = a as any as GuildChannel;
			const chB = b as any as GuildChannel;
			const chATypeScore = textChannelTypes.includes(chA.type) ? 1 : 0;
			const chBTypeScore = textChannelTypes.includes(chA.type) ? 1 : 0;
			return chATypeScore - chBTypeScore || chA.rawPosition - chB.rawPosition || chA.createdTimestamp - chB.createdTimestamp;
		});
		levelOne.push({ parentID: l0Channel.id, children: l1Channels });
	});

	// And we'll run our more strict three-way sort on the parent/non-nested channels
	levelZero.sort((a, b) => {
		const chA = a as any as GuildChannel;
		const chB = b as any as GuildChannel;
		return chA.type - chB.type || chA.rawPosition - chB.rawPosition || chA.createdTimestamp - chB.createdTimestamp
	});

	const sortedChannels: GuildChannel[] = [];

	// Now that everything's sorted, we're just pushing every channel into an array in order
	levelZero.forEach((channel) => {
		sortedChannels.push(channel as any as GuildChannel);
		const childrenContainer = levelOne.find((obj) => obj.parentID === channel.id);
		if (isNullishOrEmpty(childrenContainer) || !childrenContainer?.children.size) return;
		childrenContainer.children.forEach((childChannel) => {
			sortedChannels.push(childChannel as any as GuildChannel);
		});
	});

	return sortedChannels;
}