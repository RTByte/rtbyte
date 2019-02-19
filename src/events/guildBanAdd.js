const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanAdd' });
	}

	async run(guild, user) {
		if (guild.settings.logs.events.guildBanAdd) await this.banLog(guild, user);

		return;
	}

	async banLog(guild, user) {
		const bans = await guild.fetchBans();
		const banInfo = await bans.get(user.id);

		const embed = new MessageEmbed()
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
			.setColor(this.client.settings.colors.red)
			.setTimestamp()
			.addField(guild.language.get('GUILD_LOG_REASON'), banInfo.reason)
			.setFooter(guild.language.get('GUILD_LOG_GUILDBANADD'));

		const logChannel = await this.client.channels.get(guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
