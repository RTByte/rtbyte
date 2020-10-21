const { apis } = require('../../config');
const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const key = apis.genius;
const { Colors } = require('../../lib/util/constants');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			aliases: ['songlyrics', 'lyric'],
			description: language => language.get('COMMAND_LYRICS_DESCRIPTION'),
			runIn: ['text', 'dm'],
			usage: '<song:string>'
		});
	}

	async run(msg, [song]) {
		let lyricData;
		// eslint-disable-next-line prefer-const
		let lyricsBody = [];

		// Fetch content from Genius
		await fetch(`https://api.genius.com/search?q=${encodeURIComponent(song)}`, { headers: { Authorization: `Bearer ${key}` } })
			.then(res => res.json())
			.then(json => {
				// eslint-disable-next-line prefer-destructuring
				lyricData = json.response.hits[0];
			})
			.catch(error => {
				if (error.body.error) throw new Error(`${error.body.error}: ${error.body.error_description}`);
				throw error;
			});
		if (!lyricData) return msg.reply(`\n${msg.guild.language.get('COMMAND_LYRICS_NOT_FOUND')}`);
		// Fetch and parse lyrics
		await fetch(lyricData.result.url)
			.then(res => res.text())
			.then(text => {
				// eslint-disable-next-line id-length
				const $ = cheerio.load(text);
				const lyricsText = $('.lyrics');
				lyricsBody.push(lyricsText ? `${lyricsText.text().trim().substr(0, 1000)}...` : null);
			});

		// Assign variables from the Genius API fetch
		const artist = lyricData.result.primary_artist.name;
		const artistPic = lyricData.result.primary_artist.image_url;
		const songTitle = lyricData.result.title_with_featured;
		const songPic = lyricData.result.song_art_image_thumbnail_url;
		const geniusLink = lyricData.result.url;

		// Build and send the embed
		const embed = new MessageEmbed()
			.setAuthor(artist, artistPic)
			.setColor(Colors.white)
			.setTitle(songTitle)
			.setDescription(`[${msg.language.get('COMMAND_LYRICS_LINK')}](${geniusLink})`)
			.addField(msg.language.get('COMMAND_LYRICS_LYRICS'), lyricsBody)
			.setThumbnail(songPic)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());
		return msg.send('', { embed: embed });
	}

};
