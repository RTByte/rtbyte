const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'messageUpdate'	});
	}

	async run(old, msg) {
		if (this.client.ready && !old.partial && old.content !== msg.content) this.client.monitors.run(msg);

		if (msg.guild && msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.messageUpdate') && old.content !== msg.content) await this.editLog(old, msg);

		return;
	}

	async editLog(old, msg) {
		const embed = new MessageEmbed()
			.setAuthor(`#${msg.channel.name}`, msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.blue'))
			.setTitle(msg.guild.language.get('GUILD_LOG_MESSAGEUPDATE'))
			.setDescription(`[${msg.guild.language.get('CLICK_TO_VIEW')}](${msg.url})`)
			.addField(msg.guild.language.get('GUILD_LOG_BEFORE'), `${old.content}`)
			.addField(msg.guild.language.get('GUILD_LOG_AFTER'), `${msg.content}`)
			.setTimestamp()
			.setFooter(msg.author.tag, msg.author.displayAvatarURL());

		const logChannel = await this.client.channels.get(msg.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
