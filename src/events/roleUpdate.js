const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleUpdate' });
	}

	async run(oldRole, role) {
		if (role.guild.available && role.guild.settings.logs.events.roleUpdate) await this.roleUpdateLog(oldRole, role);

		return;
	}

	async roleUpdateLog(oldRole, role) {
		const affirmEmoji = this.client.emojis.get(this.client.settings.emoji.affirm);
		const rejectEmoji = this.client.emojis.get(this.client.settings.emoji.reject);
		const arrowRightEmoji = this.client.emojis.get(this.client.settings.emoji.arrowRight);
		const status = {
			true: affirmEmoji,
			false: rejectEmoji
		};

		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEUPDATE'));

		if (oldRole.name !== role.name) embed.addField(role.guild.language.get('GUILD_LOG_UPDATE_NAME'), `${oldRole.name} ${arrowRightEmoji} ${role.name}`);
		if (oldRole.color !== role.color) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_COLOR'), `${oldRole.hexColor} ${arrowRightEmoji} ${role.hexColor}`);
		if (oldRole.hoist !== role.hoist) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_HOIST'), status[role.hoist]);
		if (oldRole.mentionable !== role.mentionable) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_MENTIONABLE'), status[role.mentionable]);
		if (oldRole.permissions.bitfield !== role.permissions.bitfield) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_PERMISSIONS'), `\`\`\`${oldRole.permissions.toArray().join(', ')}\`\`\` \n${arrowRightEmoji} \n\`\`\`${role.permissions.toArray().join(', ')}\`\`\``); // eslint-disable-line

		const logChannel = await this.client.channels.get(role.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
