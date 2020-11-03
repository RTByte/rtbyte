import { Command, CommandOptions } from '@sapphire/framework';
import { Message, version as discordVersion } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InfoEmbed } from '@lib/structures/InfoEmbed';
import { duration } from '@util/util';
import os from 'os';

@ApplyOptions<CommandOptions>({
	description: 'commands/developer:stats.description',
	preconditions: ['DeveloperOnly']
})
export class RTByteCommand extends Command {

	public async run(msg: Message) {
		const guilds = this.client.guilds.cache.size;
		const channels = this.client.guilds.cache.size;
		const users = this.client.users.cache.size;

		const embed = await new InfoEmbed(msg)
			.boilerplate(msg, 'commands/developer:stats.embed.title');

		embed.addField(await msg.fetchLanguageKey('commands/developer:stats.embed.fields.memoryUsage'), `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
			 .addField(await msg.fetchLanguageKey('commands/developer:stats.embed.fields.uptime'), duration(<number> this.client.uptime), true)
			 .addField(await msg.fetchLanguageKey('commands/developer:stats.embed.fields.hostUptime'), duration(os.uptime() * 1000), true)
			 .addField(await msg.fetchLanguageKey('commands/developer:stats.embed.fields.connections.title'), await msg.fetchLanguageKey('commands/developer:stats.embed.fields.connections.content', { guilds, channels, users }), true)
			 .addField(await msg.fetchLanguageKey('commands/developer:stats.embed.fields.libraries.title'), await msg.fetchLanguageKey('commands/developer:stats.embed.fields.libraries.content', { discordVersion, nodejsVersion: process.version }), true)
			 .addField(await msg.fetchLanguageKey('commands/developer:stats.embed.fields.hostInfo'), `${os.type()} (${os.arch()}), ${os.hostname()}`);

		await msg.channel.send(embed);
	}

}
