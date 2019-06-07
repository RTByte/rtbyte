const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageDelete'	});
	}

	async run(msg) {
		if (msg.command && msg.command.deletable && msg.responses.length) {
			await msg.responses.forEach(async (response) => {
				await response.delete();
			});
		}

		if (msg.guild.available && msg.guild.settings.logs.events.messageDelete) await this.deleteLog(msg);
	}

	async deleteLog(msg) {
		let attachment;
		const embed = new MessageEmbed()
			.setAuthor(`#${msg.channel.name}`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(msg.author.tag, msg.author.displayAvatarURL());

		if (msg.content) await embed.addField(msg.guild.language.get('GUILD_LOG_MESSAGEDELETE'), `${msg.cleanContent}`);
		if (!msg.content) await embed.setTitle(msg.guild.language.get('GUILD_LOG_MESSAGEDELETE'));
		if (msg.attachments.size > 0) {
			attachment = msg.attachments.map(atch => atch.url).join(' ');
			attachment = attachment
				.replace('//cdn.', '//media.')
				.replace('.com/', '.net/');
			await embed.setImage(attachment);
		}
		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
