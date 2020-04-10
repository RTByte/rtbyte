const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'customCmdCreate' });
	}

	async run(msg, cmdName, cmdContent, executor) {
		if (!msg.guild) return;

		if (msg.guild.settings.channels.log && msg.guild.settings.logs.events.customCmdCreate) await this.serverLog(msg, cmdName, cmdContent, executor);

		return;
	}

	async serverLog(msg, cmdName, cmdContent, executor) {
		const embed = new MessageEmbed()
			.setAuthor(`${cmdName}`, msg.guild.iconURL())
			.setColor(this.client.settings.colors.green)
			.addField(msg.language.get('GUILD_LOG_CUSTOMCMDCREATE_RESPONSE'), cmdContent)
			.setTimestamp()
			.setFooter(msg.guild.language.get('GUILD_LOG_CUSTOMCMDCREATE', executor), executor.displayAvatarURL());
		const logChannel = await this.client.channels.cache.get(msg.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
