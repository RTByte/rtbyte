const { Command, version: klasaVersion } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { version: discordVersion } = require('discord.js');
const { capitalize, momentThreshold } = require('../../lib/util/Util');
const moment = require('moment');
const os = require('os');

momentThreshold(moment);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 10,
			guarded: true,
			description: language => language.get('COMMAND_STATS_DESCRIPTION')
		});
	}

	async run(msg) {
		const guilds = this.client.guilds.cache.size;
		const channels = this.client.channels.cache.size;
		const users = this.client.users.cache.size;
		const libraries = `• [Klasa v${klasaVersion}](https://klasa.js.org/)\n• [Discord.js v${discordVersion}](https://discord.js.org/)\n• [Node.js ${process.version}](https://nodejs.org/)`;

		const embed = new MessageEmbed()
			.setAuthor(msg.guild.language.get('COMMAND_STATS_EMBEDTITLE'), this.client.user.displayAvatarURL())
			.setColor('#ffffff')
			.addField(msg.guild.language.get('COMMAND_STATS_MEMUSAGE'), `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
			.addField(msg.guild.language.get('COMMAND_STATS_UPTIME'), capitalize(moment.duration(this.client.uptime, 'ms').humanize()), true)
			.addField(msg.guild.language.get('COMMAND_STATS_CONNECTIONS'), msg.guild.language.get('COMMAND_STATS_CONNECTIONINFO', guilds, channels, users))
			.addField(msg.guild.language.get('COMMAND_STATS_LIBRARIES'), libraries, true)
			.addField(msg.guild.language.get('COMMAND_STATS_HOSTINFO'), `${os.type()} (${os.arch()}), ${os.hostname()}`, true)
			.addField(msg.guild.language.get('COMMAND_STATS_HOSTUPTIME'), capitalize(moment.duration(os.uptime(), 's').humanize()), true)
			.setThumbnail(this.client.user.displayAvatarURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		await msg.send('', { disableEveryone: true, embed: embed });
	}

};
