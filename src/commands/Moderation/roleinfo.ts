import { RTByteCommand } from '#lib/extensions/RTByteCommand';
import { RTByteEmbed } from '#lib/extensions/RTByteEmbed';
import { Emojis } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { type ChatInputCommand } from '@sapphire/framework';
import { inlineCodeBlock } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Retrieve information about a role'
})
export class UserCommand extends RTByteCommand {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
				.setDMPermission(false)
				.addRoleOption((option) =>
					option
						.setName('role')
						.setDescription('The role to fetch information for')
						.setRequired(true)
				)
				.addBooleanOption((option) =>
					option
						.setName('ephemeral')
						.setDescription('Whether or not the message should be shown only to you (default false)')
				), {
			idHints: [
				// Dev bot command
				'1124670120934002728',
			],
		});
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
		// Check to see if response should be ephemeral
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
		await interaction.deferReply({ ephemeral, fetchReply: true });

		// Fetch targetRole from Discord
		const targetRole = interaction.guild?.roles.resolve(interaction.options.getRole('role')?.id as string);
		if (!targetRole) return interaction.followUp({ content: `${Emojis.X} Unable to fetch information for ${targetRole}, please try again later.`, ephemeral });

		// Find targetRole's position in Guild Roles
		const rolesSorted = interaction.guild?.roles.cache.sort((roleA, roleB) => roleA.position - roleB.position).reverse();

		// Gather Info for Response Embed
		const roleInfo = [];
		if (targetRole?.mentionable) roleInfo.push(`${Emojis.Bullet}Mentionable`);
		if (targetRole?.hoist) roleInfo.push(`${Emojis.Bullet}Displayed separately`);
		if (targetRole.tags?.premiumSubscriberRole) roleInfo.push(`${Emojis.Bullet}Received when boosting server`);
		if (targetRole.tags?.botId) roleInfo.push(`${Emojis.Bullet}Managed by <@${targetRole.tags.botId}>`);

		// Create Response Embed
		const embed = new RTByteEmbed()
			.setDescription(`${targetRole?.unicodeEmoji ?? ''}${targetRole} ${inlineCodeBlock(`${targetRole?.id}`)}`)
			.setThumbnail(targetRole?.iconURL() ?? interaction.guild?.iconURL() ?? null)
			.setColor(targetRole?.color as number)
			.addFields(
				{ name: 'Members', value: inlineCodeBlock(`${targetRole?.members.size}`), inline: true },
				{ name: 'Color', value: inlineCodeBlock(`${targetRole?.hexColor}`), inline: true },
				{ name: 'Hierarchy', value: inlineCodeBlock(`${rolesSorted!.map(r => r.position).indexOf(targetRole?.position as number) + 1}`), inline: true },
				{ name: 'Created', value: `<t:${Math.round(targetRole?.createdTimestamp as number / 1000)}:R>` }
			);

		// Add additional info to Response Embed
		if (roleInfo.length) embed.addFields({ name: 'Details', value: roleInfo.join('\n') });

		// Send Response Embed
		return interaction.followUp({ content: '', embeds: [embed], ephemeral });
	}
}