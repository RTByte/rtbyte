const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'customCmdCreate' });
	}

	async run(msg, cmdName, cmdContent) {
		if (!msg.guild) return;

		const executor = msg.author;
		if (msg.guild.settings.get('channels.log') && msg.guild.settings.get('logs.events.customCmdCreate')) await this.serverLog(msg, cmdName, cmdContent, executor);

		return;
	}

	async serverLog(msg, cmdName, cmdContent, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`${cmdName}`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.green)
			.addField(msg.language.get('GUILD_LOG_CUSTOMCMDCREATE_RESPONSE'), cmdContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_CUSTOMCMDCREATE', executor), executor.displayAvatarURL());
		const logChannel = await this.client.channels.get(msg.guild.settings.get('channels.log'));
		if (logChannel) await logChannel.send('', { disableEveryone: true, embed: embed });

		return;
	}

};
