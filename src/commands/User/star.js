const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['starred', 'stars'],
			description: language => language.get('COMMAND_STAR_DESCRIPTION'),
			runIn: ['text'],
			subcommands: true,
			usage: '<top|random:default> [member:membername]',
			usageDelim: ' '
		});
	}

	async random(msg, [member]) {
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled')) return msg.send(msg.language.get('COMMAND_STAR_STARBOARD_NOT_ENABLED'));

		let attachment;
		const starredMessages = msg.guild.settings.get('boards.starboard.starred');
		if (!starredMessages) return msg.send(msg.language.get('COMMAND_STAR_NOSTARRED'));

		let selected = starredMessages[Math.floor(Math.random() * starredMessages.length)];
		if (member) selected = starredMessages.filter(st => member.id === st.msgAuthor)[Math.floor(Math.random() * starredMessages.filter(st => member.id === st.msgAuthor).length)];
		if (starredMessages.filter(st => member.id === st.msgAuthor).length === 0) return msg.reject(msg.language.get('COMMAND_STAR_MEMBER_NOSTARRED'));
		const { msgID, channelID, stars } = selected;

		const channel = await msg.guild.channels.get(channelID);
		const fetchedStar = await channel.messages.fetch(msgID);

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_STAR_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.gold'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${fetchedStar.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), fetchedStar.author, true)
			.addField(msg.language.get('CHANNEL'), fetchedStar.channel, true)
			.setThumbnail(fetchedStar.author.displayAvatarURL())
			.setTimestamp(fetchedStar.createdTimestamp)
			.setFooter(`🌟 ${stars}`);
		if (fetchedStar.content) await embed.addField(msg.guild.language.get('MESSAGE'), fetchedStar.content);
		if (fetchedStar.attachments.size > 0) {
			attachment = fetchedStar.attachments.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async top(msg, [member]) {
		if (!msg.guild.settings.get('boards.starboard.starboardEnabled')) return msg.send(msg.language.get('COMMAND_STAR_STARBOARD_NOT_ENABLED'));

		let attachment;
		const starredMessages = msg.guild.settings.get('boards.starboard.starred');
		if (!starredMessages) return msg.send(msg.language.get('COMMAND_STAR_NOSTARRED'));

		const top = Math.max(...starredMessages.map(st => st.stars), 0);
		let selected = starredMessages.find(st => st.stars === top);
		if (member) selected = starredMessages.filter(st => member.id === st.msgAuthor).find(st => st.stars === top);
		if (!selected) return msg.reject(msg.language.get('COMMAND_STAR_NOTOP', member));
		const { msgID, channelID, stars } = selected;

		const channel = await msg.guild.channels.get(channelID);
		const fetchedStar = await channel.messages.fetch(msgID);

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_STAR_STARRED'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.gold'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${fetchedStar.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), fetchedStar.author, true)
			.addField(msg.language.get('CHANNEL'), fetchedStar.channel, true)
			.setThumbnail(fetchedStar.author.displayAvatarURL())
			.setTimestamp(fetchedStar.createdTimestamp)
			.setFooter(`🌟 ${stars}`);
		if (fetchedStar.content) await embed.addField(msg.guild.language.get('MESSAGE'), fetchedStar.content);
		if (fetchedStar.attachments.size > 0) {
			attachment = fetchedStar.attachments.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}

		return msg.send('', { disableEveryone: true, embed: embed });
	}

};
