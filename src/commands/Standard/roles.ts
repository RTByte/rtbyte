import { RTByteSubCommand } from '#lib/extensions/RTByteCommand';
import { RTByteEmbed } from '#lib/extensions/RTByteEmbed';
import { Emojis } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { type ChatInputCommand } from '@sapphire/framework';
import type { Subcommand } from '@sapphire/plugin-subcommands';
import { inlineCodeBlock } from '@sapphire/utilities';
import type { AutocompleteInteraction, RoleResolvable } from 'discord.js';

@ApplyOptions<Subcommand.Options>({
	description: 'Lets members join/leave roles that have been set as joinable on their own',
	subcommands: [
		{ name: 'list', chatInputRun: 'chatInputList' },
		{ name: 'join', chatInputRun: 'chatInputJoin' },
		{ name: 'leave', chatInputRun: 'chatInputLeave' }
	]
})
export class UserCommand extends RTByteSubCommand {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDMPermission(false)
				.addSubcommand((command) =>
					command
						.setName('list')
						.setDescription('List all joinable roles for the server')
				)
				.addSubcommand((command) =>
					command
						.setName('join')
						.setDescription('Join a role that has been set as joinable')
						.addStringOption((option) =>
								option
									.setName('role')
									.setDescription('The role you want to join')
									.setRequired(true)
									.setAutocomplete(true)
						)
				)
				.addSubcommand((command) =>
					command
						.setName('leave')
						.setDescription('Leave a role that has been set as joinable')
						.addStringOption((option) =>
								option
									.setName('role')
									.setDescription('The role you want to leave')
									.setRequired(true)
									.setAutocomplete(true)
						)
				), {
			idHints: [
				// Dev bot command
				'1124416818036097135',
			],
		});
	}

	public async chatInputList(interaction: ChatInputCommand.Interaction) {
    	await interaction.deferReply({ ephemeral: true, fetchReply: true });

		const dbGuild = await this.container.prisma.guild.findUnique({ where: { id: interaction.guild?.id } });
		const joinableRoles = dbGuild?.joinableRoles;
		if (!joinableRoles?.length) return interaction.editReply(`${Emojis.X} No roles have been set as joinable.`);

		const roles = [];
		for (const role of joinableRoles) {
			const resolvedRole = interaction.guild?.roles.resolve(role);
			if (!resolvedRole) break;
			roles.push(`${Emojis.Bullet}${resolvedRole} - ${resolvedRole.members.size} member${resolvedRole.members.size > 1 ? 's' : resolvedRole.members.size === 0 ? '' : '' }`);
		}

		const embed = new RTByteEmbed()
			.setAuthor({ name: 'Joinable roles', iconURL: interaction.guild?.iconURL() ?? undefined})
			.setDescription(roles.join('\n'));

		return interaction.editReply({ content: '', embeds: [embed] });
	}

	public async chatInputJoin(interaction: ChatInputCommand.Interaction) {
    	await interaction.deferReply({ ephemeral: true, fetchReply: true });

		const roleInput = interaction.options.getString('role');
		if (roleInput === 'none') return interaction.followUp(`${Emojis.X} No roles have been set as joinable.`);

		const member = interaction.guild?.members.resolve(interaction.member?.user.id as string);
		const resolvedRole = interaction.guild?.roles.cache.find(role => role.name === roleInput);
		if (!resolvedRole) return interaction.followUp(`${Emojis.X} The specified role could not be resolved.`);

		await member?.roles.add(resolvedRole as RoleResolvable, 'Joinable roles: member joined role');
		return interaction.followUp(`${Emojis.Check} Joined ${inlineCodeBlock(resolvedRole.name)}!`);
	}

	public async chatInputLeave(interaction: ChatInputCommand.Interaction) {
    	await interaction.deferReply({ ephemeral: true, fetchReply: true });

		const roleInput = interaction.options.getString('role');
		if (roleInput === 'none') return interaction.followUp(`${Emojis.X} None of your roles are set as joinable.`);

		const member = interaction.guild?.members.resolve(interaction.member?.user.id as string);
		const resolvedRole = interaction.guild?.roles.cache.find(role => role.name === roleInput);
		if (!resolvedRole) return interaction.followUp(`${Emojis.X} The specified role could not be resolved.`);

		await member?.roles.remove(resolvedRole, 'Joinable roles: member left role');
		return interaction.followUp(`${Emojis.Check} Left ${inlineCodeBlock(resolvedRole.name)}`);
	}

	public async autocompleteRun(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);
		const subcommand = interaction.options.getSubcommand(true);

		if (focusedOption.name === 'role' && subcommand === 'join') {
			const dbGuild = await this.container.prisma.guild.findUnique({ where: { id: interaction.guild?.id } });
			const member = interaction.guild?.members.resolve(interaction.user.id);
			const joinableRoles = dbGuild?.joinableRoles.filter(r => !member?.roles.cache.has(r));
			if (!joinableRoles?.length) return interaction.respond([{ name: 'None available', value: 'none' }]);

			const roles = [];
			for (const role of joinableRoles) {
				const resolvedRole = interaction.guild?.roles.resolve(role);
				if (!resolvedRole) break;
				roles.push(resolvedRole.name);
			}

			return interaction.respond(
				roles.map(role => ({ name: role, value: role}))
			);
		}

		if (focusedOption.name === 'role' && subcommand === 'leave') {
			const dbGuild = await this.container.prisma.guild.findUnique({ where: { id: interaction.guild?.id } });
			const joinableRoles = dbGuild?.joinableRoles;
			const member = interaction.guild?.members.resolve(interaction.member?.user.id as string);
			
			const leavableRoles = member?.roles.cache.filter(role => joinableRoles?.includes(role.id)).map(role => ({ name: role.name, value: role.name }));
			if (!leavableRoles?.length) return interaction.respond([{ name: 'None available', value: 'none' }]);

			return interaction.respond(leavableRoles);
		}
	}
}