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
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
    	await interaction.deferReply({ ephemeral, fetchReply: true });

		const channel = interaction.guild?.channels.resolve(interaction.options.getChannel('channel')?.id as string);
		if (!channel) return interaction.followUp({ content: `${Emojis.X} Unable to fetch information for ${channel}, please try again later.`, ephemeral });
		
		const dbGuildLogs = await this.container.prisma.guildLogs.findUnique({ where: { guildId: interaction.guild?.id } });
		const embed = new RTByteEmbed()
			.setDescription(`<#${channel.id}> ${inlineCodeBlock(`${channel?.id}`)}`)
			.setThumbnail(interaction.guild?.iconURL() ?? null);
			
		if (channel.parent) embed.addFields({ name: 'Category', value: inlineCodeBlock(channel.parent.name), inline: true });
		embed.addFields({ name: 'Created', value: `<t:${Math.round(channel.createdTimestamp as number / 1000)}:R>`, inline: true });

		if (channel.type === ChannelType.GuildForum) {
			if (channel.topic) embed.addFields({ name: 'Post guidelines', value: inlineCodeBlock(channel.topic), inline: true });
			if (channel.availableTags) embed.addFields({ name: 'Tags', value: channel.availableTags.map(tag => `${tag.emoji ? channel.guild.emojis.resolve(tag.emoji.id as string) ?? tag.emoji.name : ''} ${inlineCodeBlock(tag.name)}`).join(', '), inline: true });
		}

		const channelInfo = [];
		if (channel.type === ChannelType.GuildForum) {
			if (channel.defaultReactionEmoji) channelInfo.push(`${Emojis.Bullet}Default reaction: ${channel.guild.emojis.resolve(channel.defaultReactionEmoji.id as string) ?? channel.defaultReactionEmoji.name}`);
			if (channel.rateLimitPerUser) channelInfo.push(`${Emojis.Bullet}Posts slowmode: ${inlineCodeBlock(new DurationFormatter().format(seconds(channel.rateLimitPerUser)))}`);
			if (channel.defaultThreadRateLimitPerUser) channelInfo.push(`${Emojis.Bullet}Messages slowmode: ${inlineCodeBlock(new DurationFormatter().format(seconds(channel.defaultThreadRateLimitPerUser)))}`);
			if (channel.defaultForumLayout) {
				const forumLayout = ['Not set', 'List view', 'Gallery view'];
				channelInfo.push(`${Emojis.Bullet}Default layout: ${inlineCodeBlock(`${forumLayout[channel.defaultForumLayout]}`)}`);
			}
			if (channel.defaultSortOrder) {
				const sortOrder = ['Recent activity', 'Creation time'];
				channelInfo.push(`${Emojis.Bullet}Sort order: ${inlineCodeBlock(`${sortOrder[channel.defaultSortOrder!]}`)}`)
			}
			if (channel.nsfw) channelInfo.push(`${Emojis.Bullet}Age-restricted: ${Emojis.ToggleOn}`);
			if (channel.defaultAutoArchiveDuration) channelInfo.push(`${Emojis.Bullet}Hide after inactivity: ${inlineCodeBlock(`${new DurationFormatter().format(minutes(channel.defaultAutoArchiveDuration ?? 4320))}`)}`);
		}
		if (dbGuildLogs?.logChannel === channel.id) channelInfo.push(`${Emojis.Bullet}RTByte log channel`);
		if (channelInfo.length) embed.addFields({ name: 'Details', value: channelInfo.join('\n') });
			
		return interaction.followUp({ content: '', embeds: [embed], ephemeral });
	}
}