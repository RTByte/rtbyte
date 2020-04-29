const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messagePin' });
	}

	async run(msg, executor) {
		if (!msg.guild) return;
		if (msg.guild.settings.get('boards.pinboard.pinboardIgnoredChannels').includes(msg.channel.id)) return;

		let attachment;
		const pinboardChannel = await this.client.channels.get(msg.guild.settings.get('boards.pinboard.pinboardChannel'));
		if (!msg.guild.settings.get('boards.pinboard.pinboardEnabled') || !pinboardChannel) return;

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('PINBOARD_PINNED'), msg.guild.iconURL())
			.setColor(msg.member.highestRole ? msg.member.highestRole.color : this.client.settings.get('colors.white'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${msg.url})`)
			.addField(msg.language.get('BOARD_AUTHOR'), msg.author, true)
			.addField(msg.language.get('CHANNEL'), msg.channel, true)
			.setThumbnail(msg.author.displayAvatarURL())
			.setTimestamp(msg.createdTimestamp)
			.setFooter(msg.language.get('PINBOARD_PINNED_BY', executor), executor ? executor.displayAvatarURL() : undefined);

		if (msg.content) await embed.addField(msg.guild.language.get('MESSAGE'), msg.content);
		if (msg.attachments.size > 0) {
			attachment = msg.attachments.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}

		const pinned = msg.guild.settings.get('boards.pinboard.pinned').find(pin => pin.msgID === msg.id);

		if (!pinned) {
			const message = await pinboardChannel.send('', { disableEveryone: true, embed: embed });

			const pinboardMsgID = message.id;
			await msg.guild.settings.update('boards.pinboard.pinned', { msgID: msg.id, msgAuthor: msg.author.id, channelID: msg.channel.id, pinID: pinboardMsgID, pinner: executor.id });

			await msg.unpin();
		}

		if (pinned) {
			await msg.unpin();
		}

		return;
	}

};
