import { RTByteCommand } from '#lib/extensions/RTByteCommand';
import { RTByteEmbed } from '#lib/extensions/RTByteEmbed';
import { minutes, seconds } from '#utils/common/times';
import { Emojis } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { type ChatInputCommand } from '@sapphire/framework';
import { DurationFormatter } from '@sapphire/time-utilities';
import { inlineCodeBlock } from '@sapphire/utilities';
import { ChannelType, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Retrieve information about a channel'
})
export class UserCommand extends RTByteCommand {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
				.setDMPermission(false)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to fetch information for')
						.setRequired(true)
				)
				.addBooleanOption((option) =>
					option
						.setName('ephemeral')
						.setDescription('Whether or not the message should be shown only to you (default false)')
				), {
			idHints: [
				// Dev bot command
				'1127290502476210260',
			],
		});
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		// Check to see if response should be ephemeral
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
		await interaction.deferReply({ ephemeral, fetchReply: true });

		// Fetch targetChannel from Discord
		const targetChannel = interaction.guild?.channels.resolve(interaction.options.getChannel('channel')?.id as string);
		if (!targetChannel) return interaction.followUp({ content: `${Emojis.X} Unable to fetch information for ${targetChannel}, please try again later.`, ephemeral });

		// Fetch this Guild's log settings
		const guildLogSettings = await this.container.prisma.guildSettingsInfoLogs.findUnique({ where: { id: interaction.guild?.id } });

		// Gather Info for Response Embed
		const channelInfo = [];
		if (targetChannel.type === ChannelType.GuildForum) {
			if (targetChannel.defaultReactionEmoji) channelInfo.push(`${Emojis.Bullet}Default reaction: ${targetChannel.guild.emojis.resolve(targetChannel.defaultReactionEmoji.id as string) ?? targetChannel.defaultReactionEmoji.name}`);
			if (targetChannel.rateLimitPerUser) channelInfo.push(`${Emojis.Bullet}Posts slowmode: ${inlineCodeBlock(new DurationFormatter().format(seconds(targetChannel.rateLimitPerUser)))}`);
			if (targetChannel.defaultThreadRateLimitPerUser) channelInfo.push(`${Emojis.Bullet}Messages slowmode: ${inlineCodeBlock(new DurationFormatter().format(seconds(targetChannel.defaultThreadRateLimitPerUser)))}`);
			if (targetChannel.defaultForumLayout) {
				const forumLayout = ['Not set', 'List view', 'Gallery view'];
				channelInfo.push(`${Emojis.Bullet}Default layout: ${inlineCodeBlock(`${forumLayout[targetChannel.defaultForumLayout]}`)}`);
			}
			if (targetChannel.defaultSortOrder) {
				const sortOrder = ['Recent activity', 'Creation time'];
				channelInfo.push(`${Emojis.Bullet}Sort order: ${inlineCodeBlock(`${sortOrder[targetChannel.defaultSortOrder!]}`)}`)
			}
			if (targetChannel.nsfw) channelInfo.push(`${Emojis.Bullet}Age-restricted: ${Emojis.ToggleOn}`);
			if (targetChannel.defaultAutoArchiveDuration) channelInfo.push(`${Emojis.Bullet}Hide after inactivity: ${inlineCodeBlock(`${new DurationFormatter().format(minutes(targetChannel.defaultAutoArchiveDuration ?? 4320))}`)}`);
		}
		// Show whether the targetChannel is designated as the Info Log Channel for the Guild
		if (guildLogSettings?.infoLogChannel === targetChannel.id) channelInfo.push(`${Emojis.Bullet}RTByte log channel`);

		// Create Response Embed
		const embed = new RTByteEmbed()
			.setDescription(`<#${targetChannel.id}> ${inlineCodeBlock(`${targetChannel?.id}`)}`)
			.setThumbnail(interaction.guild?.iconURL() ?? null);

		if (targetChannel.parent) embed.addFields({ name: 'Category', value: inlineCodeBlock(targetChannel.parent.name), inline: true });
		embed.addFields({ name: 'Created', value: `<t:${Math.round(targetChannel.createdTimestamp as number / 1000)}:R>`, inline: true });

		// Add Forum-Specific Info to Response Embed
		if (targetChannel.type === ChannelType.GuildForum) {
			if (targetChannel.topic) embed.addFields({ name: 'Post guidelines', value: inlineCodeBlock(targetChannel.topic), inline: true });
			if (targetChannel.availableTags) embed.addFields({ name: 'Tags', value: targetChannel.availableTags.map(tag => `${tag.emoji ? targetChannel.guild.emojis.resolve(tag.emoji.id as string) ?? tag.emoji.name : ''} ${inlineCodeBlock(tag.name)}`).join(', '), inline: true });
		}

		// Add extra information gathered in channelInfo
		if (channelInfo.length) embed.addFields({ name: 'Details', value: channelInfo.join('\n') });

		// Send response
		return interaction.followUp({ content: '', embeds: [embed], ephemeral });
	}
}