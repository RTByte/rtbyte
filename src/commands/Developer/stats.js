const { Command, version: klasaVersion, Duration } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { version: discordVersion } = require('discord.js');
const os = require('os');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: language => language.get('COMMAND_STATS_DESCRIPTION')
		});
	}

	async run(message) {
		const date = new Date(null);
		date.setSeconds(os.uptime());
		const uptimeResult = date.toISOString().substr(11, 8);

		const embed = new MessageEmbed()
			.setAuthor('RTByte Stats', this.client.user.displayAvatarURL())
			.setColor('#ffffff')
			.addField('Memory usage', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
			.addField('Uptime', Duration.toNow(Date.now() - (process.uptime() * 1000)), true)
			// eslint-disable-next-line max-len
			.addField('Connections', `Operating on **${this.client.guilds.size.toLocaleString()}** servers,\nWatching **${this.client.channels.size.toLocaleString()}** channels,\nServing **${this.client.users.size.toLocaleString()}** users`, true)
			.addField('Libraries', `• Klasa v${klasaVersion}\n• Discord.js v${discordVersion}\n• Node.js ${process.version}`, true)
			.addField('Host info', `${os.type()} (${os.arch()}), ${os.hostname()}`, true)
			.addField('Host uptime', uptimeResult, true)
			.setTimestamp()
			.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL());
		await message.send('', { disableEveryone: true, embed: embed });
	}

};
