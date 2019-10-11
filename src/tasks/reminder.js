const { Task } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Task {

	async run({ guildID, channelID, userID, dmBool, reminderMsg, timestamp }) {
		const guild = this.client.guilds.get(guildID);
		const channel = await guild.channels.get(channelID);
		const member = await guild.members.fetch(userID).catch(() => null);

		const embed = new MessageEmbed()
			.setAuthor(member.user.tag, member.user.displayAvatarURL())
			.setColor(this.client.settings.colors.white)
			.setDescription(reminderMsg)
			.setTimestamp(timestamp)
			.setFooter(`Reminder set in #${channel.name} on the ${guild.name} Discord`);

		if (dmBool) return member.user.send('', { disableEveryone: true, embed: embed });
		return channel.send(`${member}`, { disableEveryone: true, embed: embed });
	}
}