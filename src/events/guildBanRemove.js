const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildBanRemove' });
	}

	async run(guild, user) {
		if (guild.settings.logs.moderation.unban) await this.unbanLog(guild, user);

		return;
	}

	async unbanLog(guild, user) {
		const embed = new MessageEmbed()
			.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
			.setColor(this.client.settings.colors.yellow)
			.setTimestamp()
			.setFooter(guild.language.get('GUILD_LOG_GUILDBANREMOVE'));

		const logChannel = await this.client.channels.get(guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
