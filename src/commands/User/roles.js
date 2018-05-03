const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			botPerms: ['MANAGE_ROLES'],
			aliases: ['roleme', 'team', 'squad'],
			description: (msg) => msg.language.get('COMMAND_ROLES_DESCRIPTION'),
			extendedHelp: (msg => msg.language.get('COMMAND_ROLES_EXTENDED'),
			usage: '<list|join|leave|add|remove> [target:member] [roleName:string] [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('roles')) await this.client.gateways.guilds.schema.add('roles');
		if (!this.client.gateways.guilds.schema.roles.has('joinable')) await this.client.gateways.guilds.schema.roles.add('joinable', { type: 'Role', array: true, default: [] });
	}

	async list(msg) {
		if (!msg.guild.configs.roles.joinable.length) return msg.reply(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));

		const rolesList = ['**ROLES:**', '```asciidoc'];

		for (let i = 0; i < msg.guild.configs.roles.joinable.length; i++) {
			const role = msg.guild.roles.get(msg.guild.configs.roles.joinable[i]);
			rolesList.push(`${role.name} :: ${role.members.size} Members`);
		}

		rolesList.push('```');
		return msg.sendMessage(rolesList, { split: { char: '\u200b' } });
	}

	async add(msg, [target = msg.member, ...roleName]) {
		// Fail if there are no joinable roles
		if (!msg.guild.configs.roles.joinable.length) return msg.reply(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));
		if (!roleName.length) return msg.reply(msg.language.get('COMMAND_ROLES_NO_ROLE_NAME'));

		if (target.id !== msg.member.id) {
			if (!msg.hasAtLeastPermissionLevel(5) || !msg.member.permissions.has('MANAGE_ROLES')) {
				// Fail if user is not at least a moderator and is trying to add roles to other users
				return msg.reply(msg.language.get('COMMAND_ROLES_NO_PERMISSION'));
			}
			if (msg.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) {
				// Fail if user is trying to add roles to someone higher on the hierarchy than themself
				return msg.reply(msg.language.get('COMMAND_MODERATION_NOT_MODABLE', target));
			}
		}

		// Parsing the roleName array into a string
		roleName = roleName.join(' ');

		if (!msg.guild.roles.exists(role => role.name.toLowerCase() === roleName.toLowerCase())) {
			const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
			// Fail if there is no role with this name
			return msg.send(msg.language.get('COMMAND_ROLES_DOES_NOT_EXIST', rejectEmoji, roleName));
		}

		// Fetching role specified by the user
		const targetRole = await msg.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());

		if (!msg.guild.configs.roles.joinable.includes(targetRole.id)) {
			const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
			// Fail if this role isn't joinable
			return msg.send(msg.language.get('COMMAND_ROLES_NOT_JOINABLE', rejectEmoji, roleName));
		}

		if (target.roles.has(targetRole.id)) {
			const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
			// Fail if target already has this role
			return msg.send(msg.language.get('COMMAND_ROLES_ALREADY_HAVE', rejectEmoji, roleName, target));
		}

		// Add the role to the target
		await target.roles.add(targetRole);

		const affirmEmoji = await this.client.emojis.get(this.client.configs.emoji.affirm);
		return msg.react(affirmEmoji);
	}

	async remove(msg, [target = msg.member, ...roleName]) {
		// Fail if there are no joinable roles
		if (!msg.guild.configs.roles.joinable.length) return msg.reply(msg.language.get('COMMAND_ROLES_NONE_JOINABLE'));
		if (!roleName.length) return msg.reply(msg.language.get('COMMAND_ROLES_NO_ROLE_NAME'));

		if (target.id !== msg.member.id) {
			if (!msg.hasAtLeastPermissionLevel(5) || !msg.member.permissions.has('MANAGE_ROLES')) {
				// Fail if user is not at least a moderator and is trying to add roles to other users
				return msg.reply(msg.language.get('COMMAND_ROLES_NO_PERMISSION'));
			}
			if (msg.member.roles.highest.comparePositionTo(target.roles.highest) <= 0) {
				// Fail if user is trying to add roles to someone higher on the hierarchy than themself
				return msg.reply(msg.language.get('COMMAND_MODERATION_NOT_MODABLE', target));
			}
		}

		// Parsing the roleName array into a string
		roleName = roleName.join(' ');

		if (!msg.guild.roles.exists(role => role.name.toLowerCase() === roleName.toLowerCase())) {
			const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
			// Fail if there is no role with this name
			return msg.send(msg.language.get('COMMAND_ROLES_DOES_NOT_EXIST', rejectEmoji, roleName));
		}

		// Fetching role specified by the user
		const targetRole = await msg.guild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());

		if (!msg.guild.configs.roles.joinable.includes(targetRole.id)) {
			const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
			// Fail if this role isn't joinable (or leavable)
			return msg.send(msg.language.get('COMMAND_ROLES_NOT_LEAVABLE', rejectEmoji, roleName));
		}

		if (!target.roles.has(targetRole.id)) {
			const rejectEmoji = await this.client.emojis.get(this.client.configs.emoji.reject);
			// Fail if target does not have this role
			return msg.send(msg.language.get('COMMAND_ROLES_DOES_NOT_HAVE', rejectEmoji, roleName, target));
		}

		// Remove the role from the target
		await target.roles.remove(targetRole);

		const affirmEmoji = await this.client.emojis.get(this.client.configs.emoji.affirm);
		return msg.react(affirmEmoji);
	}

	async join(msg, params) {
		return this.add(msg, params);
	}

	async leave(msg, params) {
		return this.remove(msg, params);
	}

};
