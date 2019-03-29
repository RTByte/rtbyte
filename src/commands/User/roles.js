const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['MANAGE_ROLES'],
			requiredSettings: ['roles.joinable'],
			aliases: ['roleme', 'team', 'squad'],
			description: language => language.get('COMMAND_ROLES_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_ROLES_EXTENDED'),
			usage: '<list|add|remove|join|leave> [target:member] [roleName:string] [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async list(msg) {
		if (!msg.guild.settings.roles.joinable.length) return msg.reject(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));

		const rolesList = ['**Roles:**', '```asciidoc'];

		for (let i = 0; i < msg.guild.settings.roles.joinable.length; i++) {
			const role = msg.guild.roles.get(msg.guild.settings.roles.joinable[i]);
			rolesList.push(`${role.name} :: ${role.members.size} Members`);
		}

		rolesList.push('```');
		await msg.affirm();
		return msg.sendMessage(rolesList, { split: { char: '\u200b' } });
	}

	async add(msg, [target = msg.member, ...roleName]) {
		// Fail if there are no joinable roles
		if (!msg.guild.settings.roles.joinable.length) return msg.reject(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));
		if (!roleName.length) return msg.reject(msg.language.get('COMMAND_ROLES_NO_ROLE_NAME'));

		if (target.id !== msg.member.id) {
			// Fail if user is not at least a moderator and is trying to add roles to other users
			if (!msg.hasAtLeastPermissionLevel(5) || !msg.member.permissions.has('MANAGE_ROLES')) return msg.reject(msg.language.get('COMMAND_ROLES_NO_MODERATE'));

			const canMod = await msg.member.canMod(target);

			// Fail if user is trying to add roles to someone higher on the hierarchy than themself
			if (!canMod) return msg.reject(msg.language.get('COMMAND_ROLES_NO_PERMS', target));
		}

		// Parsing the roleName array into a string
		roleName = roleName.join(' ');

		// Fail if there is no role with this name
		if (!msg.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase())) return msg.reject(msg.language.get('COMMAND_ROLES_DOES_NOT_EXIST', roleName));

		// Fetching role specified by the user
		const targetRole = await msg.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());

		// Fail if this role isn't joinable
		if (!msg.guild.settings.roles.joinable.includes(targetRole.id)) return msg.reject(msg.language.get('COMMAND_ROLES_NOT_JOINABLE', roleName));

		// Fail if target already has this role
		if (target.roles.has(targetRole.id)) return msg.reject(msg.language.get('COMMAND_ROLES_ALREADY_HAVE', roleName, target));

		// Add the role to the target
		await target.roles.add(targetRole);
		return msg.affirm();
	}

	async remove(msg, [target = msg.member, ...roleName]) {
		// Fail if there are no joinable roles
		if (!msg.guild.settings.roles.joinable.length) return msg.reject(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));
		if (!roleName.length) return msg.reject(msg.language.get('COMMAND_ROLES_NO_ROLE_NAME'));

		if (target.id !== msg.member.id) {
			// Fail if user is not at least a moderator and is trying to add roles to other users
			if (!msg.hasAtLeastPermissionLevel(5) || !msg.member.permissions.has('MANAGE_ROLES')) return msg.reject(msg.language.get('COMMAND_ROLES_NO_MODERATE'));

			const canMod = await msg.member.canMod(target);

			// Fail if user is trying to add roles to someone higher on the hierarchy than themself
			if (!canMod) return msg.reject(msg.language.get('COMMAND_ROLES_NO_PERMS', target));
		}

		// Parsing the roleName array into a string
		roleName = roleName.join(' ');

		// Fail if there is no role with this name
		if (!msg.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase())) return msg.reject(msg.language.get('COMMAND_ROLES_DOES_NOT_EXIST', roleName));

		// Fetching role specified by the user
		const targetRole = await msg.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());

		// Fail if this role isn't joinable (or leavable)
		if (!msg.guild.settings.roles.joinable.includes(targetRole.id)) return msg.reject(msg.language.get('COMMAND_ROLES_NOT_LEAVABLE', roleName));

		// Fail if target does not have this role
		if (!target.roles.has(targetRole.id)) return msg.reject(msg.language.get('COMMAND_ROLES_DOES_NOT_HAVE', roleName, target));

		// Remove the role from the target
		await target.roles.remove(targetRole);
		return msg.affirm();
	}

	async join(msg, params) {
		return this.add(msg, params);
	}

	async leave(msg, params) {
		return this.remove(msg, params);
	}

};
