const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageDelete'	});
	}

	async run(msg) {
		if (msg.command && msg.command.deletable) {
			for (const message of msg.responses) {
				msg.delete();
			}
		}

		if (msg.guild.available && msg.guild.settings.logs.events.messageDelete) await this.deleteLog(msg);
	}

	async deleteLog(msg) {
		const embed = new MessageEmbed()
			.setAuthor(`#${msg.channel.name}`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.addField(msg.guild.language.get('GUILD_LOG_MESSAGEDELETE'), msg.cleanContent)
			.setTimestamp()
			.setFooter(msg.author.tag, msg.author.displayAvatarURL());

		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
