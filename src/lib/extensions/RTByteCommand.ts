import { Command } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

export abstract class RTByteCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    const resolvedPermissions = new PermissionsBitField(options.requiredClientPermissions).add(PermissionFlagsBits.EmbedLinks);

    super(context, {
      requiredClientPermissions: resolvedPermissions,
      ...options
    });
  }
}

export abstract class RTByteSubCommand extends Subcommand {
	public constructor(context: Command.Context, options: Command.Options) {
		const resolvedPermissions = new PermissionsBitField(options.requiredClientPermissions).add(PermissionFlagsBits.EmbedLinks);
	
		super(context, {
		  requiredClientPermissions: resolvedPermissions,
		  ...options
		});
	  }
}