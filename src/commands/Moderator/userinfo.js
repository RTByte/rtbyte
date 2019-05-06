const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { embedSplitter } = require('../../lib/util/Util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['uinfo'],
			permissionLevel: 5,
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_USERINFO_DESCRIPTION'),
			usage: '[member:member]'
		});
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(msg, [member = msg.member]) {
		const onlineEmoji = this.client.emojis.get(this.client.settings.emoji.online);
		const idleEmoji = this.client.emojis.get(this.client.settings.emoji.idle);
		const dndEmoji = this.client.emojis.get(this.client.settings.emoji.dnd);
		const offlineEmoji = this.client.emojis.get(this.client.settings.emoji.offline);
		const statuses = {
			online: `${onlineEmoji} Online`,
			idle: `${idleEmoji} Idle`,
			dnd: `${dndEmoji} Do Not Disturb`,
			offline: `${offlineEmoji} Offline`
		};

		const roles = await member.roles.filter(role => role.name !== '@everyone').sort().array();

		const embed = new MessageEmbed()
			.setColor(this.client.settings.colors.white)
			.addField(msg.guild.language.get('COMMAND_USERINFO_NAME'), member.user.tag, true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_ID'), member.id, true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_REGISTERED'), this.timestamp.displayUTC(member.user.createdAt), true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_JOINED'), this.timestamp.displayUTC(member.joinedTimestamp), true)
			.addField(msg.guild.language.get('COMMAND_USERINFO_STATUS'), statuses[member.user.presence.status], true)
			.setThumbnail(member.user.displayAvatarURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		if (member.user.presence.activity) {
			await embed.addField(msg.guild.language.get('COMMAND_USERINFO_ACTIVITY', member), member.user.presence.activity ? member.user.presence.activity.name : 'N/A', true);
		}

		if (roles.length) await embedSplitter(msg.guild.language.get('COMMAND_SERVERINFO_ROLES'), roles, embed);

		await msg.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
