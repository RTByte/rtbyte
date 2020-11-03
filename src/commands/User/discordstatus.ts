import { Command, CommandOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { InfoEmbed } from '@lib/structures/InfoEmbed';
import { Colors } from '@util/constants';
import fetch from 'node-fetch';


@ApplyOptions<CommandOptions>({
	aliases: ['dstatus'],
	description: 'commands/user:discordStatus.description'
})
export class RTByteCommand extends Command {

	public async run(msg: Message) {
		const status = await fetch('https://status.discordapp.com/api/v2/summary.json').then(res => res.json());
		const embed = await new InfoEmbed(msg)
			.boilerplate(msg, 'commands/user:discordStatus.embed.title', 'commands/user:discordStatus.embed.description');

		embed.setThumbnail('https://cdn.discordapp.com/embed/avatars/1.png');

		if (status.incidents.length === 0) {
			embed.setTitle(await msg.fetchLanguageKey('commands/user:discordStatus.embed.states.ok.title'))
				 .setColor(Colors.green)
				 .setThumbnail('https://cdn.discordapp.com/embed/avatars/2.png')
				 .addField(await msg.fetchLanguageKey('commands/user:discordStatus.embed.states.ok.fields.lastUpdated'), status.page.updated_at);
		}

		if (status.incidents.length > 0) {
			embed.setTitle(await msg.fetchLanguageKey('commands/user:discordStatus.embed.states.notOk.title'))
				 .setDescription(await msg.fetchLanguageKey('commands/user:discordStatus.embed.states.notOk.description', { link: `https://discordstatus.com/incidents/${status.incidents[0].incident_id}` }))
				 .setColor(Colors.yellow)
				 .setThumbnail('https://cdn.discordapp.com/embed/avatars/3.png')
				 .addField(await msg.fetchLanguageKey('commands/user:discordStatus.embed.states.notOk.fields.incidentTimestamp'), status.incidents[0].created_at)
				 .addField(await msg.fetchLanguageKey('commands/user:discordStatus.embed.states.notOk.fields.incidentUpdates'), status.incidents[0].incident_updated[0].body);
		}

		return msg.channel.send(embed);
	}

}
