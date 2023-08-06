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
		const ephemeral = interaction.options.getBoolean('ephemeral') ?? false;
    	await interaction.deferReply({ ephemeral, fetchReply: true });

		const role = interaction.guild?.roles.resolve(interaction.options.getRole('role')?.id as string);
		if (!role) return interaction.followUp({ content: `${Emojis.X} Unable to fetch information for ${role}, please try again later.`, ephemeral });
		
		const rolesSorted = interaction.guild?.roles.cache.sort((roleA, roleB) => roleA.position - roleB.position).reverse();
		const dbGuild = await this.container.prisma.guild.findUnique({ where: { id: interaction.guild?.id }});
		const embed = new RTByteEmbed()
			.setDescription(`${role?.unicodeEmoji ?? ''}${role} ${inlineCodeBlock(`${role?.id}`)}`)
			.setThumbnail(role?.iconURL() ?? interaction.guild?.iconURL() ?? null)
			.setColor(role?.color as number)
			.addFields(
				{ name: 'Members', value: inlineCodeBlock(`${role?.members.size}`), inline: true },
				{ name: 'Color', value: inlineCodeBlock(`${role?.hexColor}`), inline: true },
				{ name: 'Hierarchy', value: inlineCodeBlock(`${rolesSorted!.map(r => r.position).indexOf(role?.position as number) + 1}`), inline: true },
				{ name: 'Created', value: `<t:${Math.round(role?.createdTimestamp as number / 1000)}:R>` }
			);
			
			const roleInfo = [];
			if (role?.mentionable) roleInfo.push(`${Emojis.Bullet}Mentionable`);
			if (role?.hoist) roleInfo.push(`${Emojis.Bullet}Displayed separately`);
			if (dbGuild?.joinableRoles.includes(role.id)) roleInfo.push(`${Emojis.Bullet}Joinable`);
			if (role.tags?.premiumSubscriberRole) roleInfo.push(`${Emojis.Bullet}Received when boosting server`);
			if (role.tags?.botId) roleInfo.push(`${Emojis.Bullet}Managed by <@${role.tags.botId}>`);
			if (roleInfo.length) embed.addFields({ name: 'Details', value: roleInfo.join('\n') });
			
		return interaction.followUp({ content: '', embeds: [embed], ephemeral });
	}
}