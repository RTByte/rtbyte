const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run() {
		await this.weeklyRebootLog();
		await Promise.all(this.client.providers.map(provider => provider.shutdown()));
		process.exit();
	}

	async weeklyRebootLog() {
		const embed = new MessageEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setColor(this.client.settings.colors.yellow)
			.setTimestamp()
			.setFooter('Performing monthly reboot...');
		const globalLog = await this.client.channels.cache.get(this.client.settings.channels.globalLog);
		if (globalLog) await globalLog.send('', { disableEveryone: true, embed: embed }).catch(err => this.client.emit('error', err));
	}

};
