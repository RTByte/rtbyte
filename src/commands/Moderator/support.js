const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			requiredPermissions: ['ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			runIn: ['text'],
			description: language => language.get('COMMAND_SUPPORT_DESCRIPTION'),
			usage: '[reason:...string]',
			usageDelim: ' '
		});
	}

	async run(msg, [...reason]) {
		const globalLogChannel = await this.client.channels.get(this.client.settings.get('channels.globalLog'));
		await msg.channel.createInvite({ temporary: true, maxUses: 10, unique: true, reason: msg.language.get('COMMAND_SUPPORT_INVITE_GENERATED') })
			.then(invite => {
				const embed = new MessageEmbed()
					.setAuthor(`${msg.guild.name} (#${msg.channel.name})`, msg.guild.iconURL())
					.setColor(this.client.settings.get('colors.red'))
					.setTitle(msg.guild.language.get('COMMAND_SUPPORT_REQUESTED'))
					.setDescription(`[${msg.guild.language.get('COMMAND_SUPPORT_JUMPTO')}](${msg.url}) / [${msg.guild.language.get('COMMAND_SUPPORT_JOINSERVER')}](${invite.url})`)
					.setTimestamp()
					.setFooter(msg.author.tag, msg.author.displayAvatarURL());

				if (reason.length) embed.addField('Reason', reason.join(' '));
				if (globalLogChannel) globalLogChannel.send(`<@&${this.client.options.controlGuildDeveloperRole}>`, { disableEveryone: false, embed: embed });

				return msg.affirm(msg.guild.language.get('COMMAND_SUPPORT_CONTACTED'));
			});
	}

};
