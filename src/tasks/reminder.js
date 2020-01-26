const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run({ guildID, channelID, userID, dmBool, reminderMsg, timestamp }) {
		const guild = this.client.guilds.get(guildID);
		const channel = guild ? await guild.channels.get(channelID) : await this.client.users.get(userID);
		const member = guild ? await guild.members.fetch(userID).catch(() => null) : await this.client.users.get(userID);

		const embed = new MessageEmbed()
			.setAuthor(guild ? member.user.tag : member.tag, guild ? member.user.displayAvatarURL() : member.displayAvatarURL())
			.setColor(this.client.settings.get('colors.white'))
			.setDescription(reminderMsg)
			.setTimestamp(timestamp)
			.setFooter(`Reminder set in ${guild ? channel.name : 'DMs'}${guild ? ` on the ${guild.name} Discord` : ''}`);

		if (dmBool) return member.user.send('', { disableEveryone: true, embed: embed });
		return channel.send(`${member}`, { disableEveryone: true, embed: embed });
	}

};
