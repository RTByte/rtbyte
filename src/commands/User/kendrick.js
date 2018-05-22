const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['lamar'],
			enabled: true,
			runIn: ['text'],
			requiredSettings: [],
			permissionLevel: 5,
			description: 'kendrick'
		});
	}

	async run(msg) {
		const discography = require('../../assets/data/kendrick.json');

		const song = discography.songs[Math.floor(Math.random() * discography.songs.length)];
		const lyric = song.lyrics[Math.floor(Math.random() * song.lyrics.length)];

		const embed = new MessageEmbed()
			.setAuthor(`Kendrick Lamar - ${song.title}`)
			.setDescription(lyric)
			.setFooter(`${song.album} - ${song.year}`);

		return msg.channel.send('', { embed: embed });
	}

};
