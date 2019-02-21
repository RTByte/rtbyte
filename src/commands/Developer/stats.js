const { Command, version: klasaVersion, Duration } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { version: discordVersion } = require('discord.js');
const os = require('os');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_STATS_DESCRIPTION')
		});
	}

	async run(message) {
		const date = new Date(null);
		date.setSeconds(os.uptime());
		const uptimeResult = date.toISOString().substr(11, 8);

		const embed = new MessageEmbed()
			.setAuthor(message.guild.language.get('COMMAND_STATS_EMBEDTITLE'), this.client.user.displayAvatarURL())
			.setColor('#ffffff')
			.addField(message.guild.language.get('COMMAND_STATS_MEMUSAGE'), `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
			.addField(message.guild.language.get('COMMAND_STATS_UPTIME'), Duration.toNow(Date.now() - (process.uptime() * 1000)), true)
			// eslint-disable-next-line max-len
			.addField(message.guild.language.get('COMMAND_STATS_CONNECTIONS'), `Operating on **${this.client.guilds.size.toLocaleString()}** servers,\nWatching **${this.client.channels.size.toLocaleString()}** channels,\nServing **${this.client.users.size.toLocaleString()}** users`, true)
			// eslint-disable-next-line max-len
			.addField(message.guild.language.get('COMMAND_STATS_LIBRARIES'), `• [Klasa v${klasaVersion}](https://klasa.js.org/)\n• [Discord.js v${discordVersion}](https://discord.js.org/)\n• [Node.js ${process.version}](https://nodejs.org/)`, true)
			.addField(message.guild.language.get('COMMAND_STATS_HOSTINFO'), `${os.type()} (${os.arch()}), ${os.hostname()}`, true)
			.addField(message.guild.language.get('COMMAND_STATS_HOSTUPTIME'), uptimeResult, true)
			.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
			.setTimestamp()
			.setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL());
		await message.send('', { disableEveryone: true, embed: embed });
	}

};
