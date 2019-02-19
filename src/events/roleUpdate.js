const { Event } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'roleUpdate' });
		this.status = {
			true: '<:affirm:547464582763905033>',
			false: '<:reject:547464582780944384>'
		};
	}

	async run(oldRole, role) {
		if (role.guild.available && role.guild.settings.logs.events.roleUpdate) await this.roleUpdateLog(oldRole, role);

		return;
	}

	async roleUpdateLog(oldRole, role) {
		const embed = new MessageEmbed()
			.setAuthor(`${role.name}`, role.guild.iconURL())
			.setColor(this.client.settings.colors.blue)
			.setTimestamp()
			.setFooter(role.guild.language.get('GUILD_LOG_ROLEUPDATE'));

		if (oldRole.name !== role.name) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_NAME'), `${oldRole.name} <:arrowRight:547464582739001384> ${role.name}`);
		if (oldRole.color !== role.color) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_COLOR'), `${oldRole.hexColor} <:arrowRight:547464582739001384> ${role.hexColor}`);
		if (oldRole.hoist !== role.hoist) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_HOIST'), this.status[role.hoist]);
		if (oldRole.mentionable !== role.mentionable) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_MENTIONABLE'), this.status[role.mentionable]);
		if (oldRole.permissions.bitfield !== role.permissions.bitfield) embed.addField(role.guild.language.get('GUILD_LOG_ROLEUPDATE_PERMISSIONS'), `\`\`\`${oldRole.permissions.toArray().join(', ')}\`\`\` \n<:arrowRight:547464582739001384> \n\`\`\`${role.permissions.toArray().join(', ')}\`\`\``); // eslint-disable-line

		const logChannel = await this.client.channels.get(role.guild.settings.channels.log);
		await logChannel.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
