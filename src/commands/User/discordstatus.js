const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { momentThreshold, timezone } = require('../../lib/util/util');
const moment = require('moment-timezone');

momentThreshold(moment);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['dstatus'],
			description: language => language.get('COMMAND_DISCORDSTATUS_DESCRIPTION'),
			runIn: ['text', 'dm']
		});
	}

	async run(msg) {
		fetch('https://status.discordapp.com/api/v2/summary.json')
			.then(res => res.json())
			.then(json => {
				const embed = new MessageEmbed()
					.setDescription(`[${msg.language.get('COMMAND_DISCORDSTATUS_LINK')}](${json.page.url})`)
					.setThumbnail('https://cdn.discordapp.com/embed/avatars/1.png')
					.setTimestamp()
					.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

				if (json.incidents.length === 0) {
					embed.setTitle(msg.language.get('COMMAND_DISCORDSTATUS_ALLOK'))
						.setColor(this.client.settings.get('colors.green'))
						.setThumbnail('https://cdn.discordapp.com/embed/avatars/2.png')
						.addField(msg.language.get('COMMAND_DISCORDSTATUS_LASTUPDATE'), timezone(json.page.updated_at, msg.guild));
				}

				const incident = json.incidents[0];
				if (incident) {
					embed.setTitle(msg.language.get('COMMAND_DISCORDSTATUS_INCIDENT'))
						.setDescription(`[${msg.language.get('COMMAND_DISCORDSTATUS_INCIDENT_LINK')}](https://status.discordapp.com/incidents/${incident.incident_id}/)`)
						.setColor(this.client.settings.get('colors.yellow'))
						.setThumbnail('https://cdn.discordapp.com/embed/avatars/3.png')
						.addField(msg.language.get('COMMAND_DISCORDSTATUS_INCIDENT_TSTAMP'), timezone(incident.created_at, msg.guild))
						.addField(msg.language.get('COMMAND_DISCORDSTATUS_INCIDENT_UPDATES'), incident.incident_updates[0].body);
				}

				return msg.send(embed);
			});
	}

};
