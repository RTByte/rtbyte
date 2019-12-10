const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { embedSplitter } = require('../../lib/util/Util');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['uinfo'],
			permissionLevel: 6,
			requiredPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_USERINFO_DESCRIPTION'),
			usage: '[member:membername]'
		});
		this.timestamp = new Timestamp('d MMMM YYYY, h:mm A');
	}

	async run(msg, [membername = msg.member]) {
		const onlineEmoji = this.client.emojis.get(this.client.settings.emoji.online);
		const idleEmoji = this.client.emojis.get(this.client.settings.emoji.idle);
		const dndEmoji = this.client.emojis.get(this.client.settings.emoji.dnd);
		const offlineEmoji = this.client.emojis.get(this.client.settings.emoji.offline);
		const statuses = {
			online: `${onlineEmoji} ${msg.guild.language.get('ONLINE')}`,
			idle: `${idleEmoji} ${msg.guild.language.get('IDLE')}`,
			dnd: `${dndEmoji} ${msg.guild.language.get('DND')}`,
			offline: `${offlineEmoji} ${msg.guild.language.get('OFFLINE')}`
		};

		const roles = await membername.roles.filter(role => role.name !== '@everyone').sort().array();

		const joinPosition = await msg.guild.members.array().sort((first, last) => first.joinedAt - last.joinedAt);

		const position = joinPosition.indexOf(membername) + 1;

		const embed = new MessageEmbed()
			.setColor(!membername.premiumSince ? this.client.settings.colors.white : this.client.settings.colors.pink)
			.addField(msg.guild.language.get('NAME'), `${membername} (${membername.user.tag})`, true)
			.addField(msg.guild.language.get('ID'), membername.id, true)
			.addField(msg.language.get('JOIN_POS'), position)
			.addField(msg.guild.language.get('JOINED'), `${this.timestamp.displayUTC(membername.joinedTimestamp)} (UTC)`)
			.addField(msg.guild.language.get('REGISTERED'), `${this.timestamp.displayUTC(membername.user.createdAt)} (UTC)`)
			.addField(msg.guild.language.get('COMMAND_USERINFO_STATUS'), statuses[membername.user.presence.status], true)
			.setThumbnail(membername.user.displayAvatarURL())
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		if (membername.user.presence.activity) {
			// eslint-disable-next-line max-len
			await embed.addField(!membername.user.presence.activity.type ? membername.user.presence.activity.name : msg.guild.language.get('COMMAND_USERINFO_ACTIVITY', membername), !membername.user.presence.activity.type ? membername.user.presence.activity.state || 'N/A' : membername.user.presence.activity ? (!membername.user.presence.activity.details ? membername.user.presence.activity.name : `${membername.user.presence.activity.name}\n\`${membername.user.presence.activity.details}\``) : 'N/A', true);
		}

		if (membername.premiumSince) {
			await embed.addField(msg.guild.language.get('COMMAND_USERINFO_NITROBOOST'), this.timestamp.displayUTC(membername.premiumSince), true);
		}

		if (roles.length) await embedSplitter(msg.guild.language.get('ROLES'), roles, embed);

		await msg.send('', { disableEveryone: true, embed: embed });
		return;
	}

};
