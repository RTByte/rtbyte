const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'customCmdCreate' });
	}

	async run(msg, cmdName, cmdContent) {
		if (msg.guild.available && msg.guild.settings.logs.events.customCmdCreate) await this.customCmdCreateLog(msg, cmdName, cmdContent);

		return;
	}

	async customCmdCreateLog(msg, cmdName, cmdContent) {
		const embed = new MessageEmbed()
			.setAuthor(`${cmdName}`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.green)
			.addField(msg.language.get('GUILD_LOG_CUSTOMCMDCREATE_RESPONSE'), cmdContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_CUSTOMCMDCREATE'));
		const logChannel = await this.client.channels.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
