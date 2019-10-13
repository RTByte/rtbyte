const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['wikipedia'],
			description: language => language.get('COMMAND_WIKI_DESCRIPTION'),
			usage: '<query:str>'
		});
	}

	async run(msg, [query]) {
		await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
			.then(response => response.json())
			.then(json => {
				console.log(json);
				const embed = new MessageEmbed()
					.setAuthor(msg.guild.language.get('COMMAND_WIKI_WIKIPEDIA'), 'https://i.imgur.com/fnhlGh5.png')
					.setColor(this.client.settings.colors.white)
					.setTitle(json.title)
					.setDescription(`[${msg.guild.language.get('COMMAND_WIKI_LINK')}](${json.content_urls.desktop.page})`)
					.addField(msg.guild.language.get('COMMAND_WIKI_EMBED_DESC'), `${json.description}.`)
					.addField(msg.guild.language.get('COMMAND_WIKI_EMBED_INFO'), json.extract)
					.setThumbnail((json.thumbnail && json.thumbnail.source) || 'https://i.imgur.com/fnhlGh5.png')
					.setTimestamp()
					.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());
				return msg.sendEmbed(embed);
			})
			.catch(() => { throw msg.guild.language.get('COMMAND_WIKI_NOTFOUND'); });
	}

};
