const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['MANAGE_ROLES'],
			requiredSettings: ['roles.joinable'],
			aliases: ['roleme', 'team', 'squad', 'role'],
			description: language => language.get('COMMAND_ROLES_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_ROLES_EXTENDED'),
			usage: '<add|remove|join|leave|list:default> [target:membername] [role:rolename]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async list(msg) {
		if (!msg.guild.settings.get('roles.joinable').length) return msg.reject(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));

		const embed = new MessageEmbed()
			.setAuthor(msg.language.get('COMMAND_ROLES_SERVER'), msg.guild.iconURL())
			.setColor(this.client.settings.get('colors.white'))
			.setThumbnail(msg.guild.iconURL(), 50, 50)
			.setTimestamp()
			.setFooter(msg.language.get('COMMAND_REQUESTED_BY', msg), msg.author.displayAvatarURL());

		const rolesList = [];
		for (let i = 0; i < msg.guild.settings.get('roles.joinable').length; i++) {
			const role = msg.guild.roles.get(msg.guild.settings.get('roles.joinable')[i]);
			rolesList.push(msg.language.get('COMMAND_ROLES_ROLE', role));
		}
		embed.setDescription(rolesList);

		return msg.send('', { disableEveryone: true, embed: embed });
	}

	async add(msg, [target = msg.member, rolename]) {
		// Fail if there are no joinable roles
		if (!msg.guild.settings.get('roles.joinable').length) return msg.reject(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));
		if (!rolename) return msg.reject(msg.language.get('COMMAND_ROLES_NO_ROLE_NAME'));

		if (target.id !== msg.member.id) {
			// Fail if user is not at least a moderator and is trying to add roles to other users
			if (!msg.hasAtLeastPermissionLevel(5) || !msg.member.permissions.has('MANAGE_ROLES')) return msg.reject(msg.language.get('COMMAND_ROLES_NO_MODERATE'));

			const canMod = await msg.member.canMod(target.user);

			// Fail if user is trying to add roles to someone higher on the hierarchy than themself
			if (!canMod) return msg.reject(msg.language.get('COMMAND_ROLES_NO_PERMS', target));
		}

		// Fail if this role isn't joinable
		if (!msg.guild.settings.get('roles.joinable').includes(rolename.id)) return msg.reject(msg.language.get('COMMAND_ROLES_NOT_JOINABLE', rolename));

		// Fail if target already has this role
		if (target.roles.has(rolename.id)) return msg.reject(msg.language.get('COMMAND_ROLES_ALREADY_HAVE', rolename, target));

		// Add the role to the target
		await target.roles.add(rolename);
		return msg.affirm();
	}

	async remove(msg, [target = msg.member, rolename]) {
		// Fail if there are no joinable roles
		if (!msg.guild.settings.get('roles.joinable').length) return msg.reject(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));
		if (!rolename) return msg.reject(msg.language.get('COMMAND_ROLES_NO_ROLE_NAME'));

		if (target.id !== msg.member.id) {
			// Fail if user is not at least a moderator and is trying to add roles to other users
			if (!msg.hasAtLeastPermissionLevel(5) || !msg.member.permissions.has('MANAGE_ROLES')) return msg.reject(msg.language.get('COMMAND_ROLES_NO_MODERATE'));

			const canMod = await msg.member.canMod(target);

			// Fail if user is trying to add roles to someone higher on the hierarchy than themself
			if (!canMod) return msg.reject(msg.language.get('COMMAND_ROLES_NO_PERMS', target));
		}

		// Fail if this role isn't joinable (or leavable)
		if (!msg.guild.settings.get('roles.joinable').includes(rolename.id)) return msg.reject(msg.language.get('COMMAND_ROLES_NOT_LEAVABLE', rolename));

		// Fail if target does not have this role
		if (!target.roles.has(rolename.id)) return msg.reject(msg.language.get('COMMAND_ROLES_DOES_NOT_HAVE', rolename, target));

		// Remove the role from the target
		await target.roles.remove(rolename);
		return msg.affirm();
	}

	async join(msg, params) {
		return this.add(msg, params);
	}

	async leave(msg, params) {
		return this.remove(msg, params);
	}

};
