const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const nsfw = require('naughty-words/en.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['wikipedia'],
			description: language => language.get('COMMAND_WIKI_DESCRIPTION'),
			runIn: ['text', 'dm'],
			usage: '<query:str>'
		});
	}

	async run(msg, [query]) {
		const blacklist = msg.guild.settings.filters.words;
		if (!msg.channel.nsfw && await this.nsfwWord(query)) return msg.reject(msg.language.get('COMMAND_WIKI_NSFW_WORD'));
		if (await this.blacklistedWord(query, blacklist)) return msg.reject();
		await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
			.then(response => response.json())
			.then(json => {
				const embed = new MessageEmbed()
					.setAuthor(msg.language.get('COMMAND_WIKI_WIKIPEDIA'), 'https://i.imgur.com/fnhlGh5.png')
					.setColor(this.client.settings.colors.white)
					.setTitle(json.title)
					.setDescription(`[${msg.language.get('COMMAND_WIKI_LINK')}](${json.content_urls.desktop.page})`)
					.addField(msg.language.get('COMMAND_WIKI_EMBED_DESC'), `${json.description}.`)
					.addField(msg.language.get('COMMAND_WIKI_EMBED_INFO'), json.extract)
					.setThumbnail((json.thumbnail && json.thumbnail.source) || 'https://i.imgur.com/fnhlGh5.png')
					.setTimestamp()
					.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());
				return msg.send(embed);
			})
			.catch(() => { throw msg.language.get('COMMAND_WIKI_NOTFOUND'); });
	}

	async nsfwWord(query) {
		let hasNsfwWord = false;
		let regex;

		for (let i = 0; i < nsfw.length; i++) {
			regex = new RegExp(`${nsfw[i]}`);
			if (query.toLowerCase().match(regex)) hasNsfwWord = true;
		}

		return hasNsfwWord;
	}

	async blacklistedWord(query, blacklist) {
		let hasBlacklistedWord = false;
		let regex;

		for (let i = 0; i < blacklist.length; i++) {
			regex = new RegExp(`${blacklist[i]}`);
			if (query.toLowerCase().match(regex)) hasBlacklistedWord = true;
		}

		return hasBlacklistedWord;
	}

};
