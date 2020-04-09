const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleDelete' });
	}

	async run(role) {
		if (!role.guild) return;

		if (role.guild.settings.get('channels.log') && role.guild.settings.get('logs.events.roleDelete')) await this.roleDeleteLog(role);

		return;
	}

	async roleDeleteLog(role) {
		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.get('colors.red'))
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEDELETE'));

		if (role.guild.settings.get('logs.verboseLogging')) {
			embed.addField(role.guild.language.get('ID'), role.id, true);
		}

		const logChannel = await this.client.channels.get(role.guild.settings.get('channels.log'));
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
