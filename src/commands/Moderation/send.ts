import { RTByteCommand } from '#lib/extensions/RTByteCommand';
import { Emojis } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { type ChatInputCommand } from '@sapphire/framework';
import { inlineCodeBlock } from '@sapphire/utilities';
import { ChannelType, PermissionFlagsBits } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Sends a message to the specified channel as the bot'
})
export class UserCommand extends RTByteCommand {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
				.setDMPermission(false)
				.addChannelOption((option) =>
					option
						.setName('channel')
						.setDescription('The channel to send a message to')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('message')
						.setDescription('The message you want to send')
						.setRequired(true)
				), {
			idHints: [
				// Dev bot command
				'1124787510304850103',
			],
		});
	}

	public async chatInputRun(interaction: ChatInputCommand.Interaction) {
    	await interaction.deferReply({ ephemeral: true });

		const channel = interaction.guild?.channels.resolve(interaction.options.getChannel('channel')?.id as string);
		const messageInput = interaction.options.getString('message') as string;
		if (channel?.type !== ChannelType.GuildText) return interaction.followUp({ content: `${Emojis.X} Messages cannot be sent to ${channel}.` });

		await channel.send({ content: messageInput});
		return interaction.followUp({ content: `${Emojis.Check} Sent ${inlineCodeBlock(messageInput)} to <#${channel.id}>!`});
	}
}