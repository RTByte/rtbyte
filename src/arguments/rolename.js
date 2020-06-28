// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
// Modified by the RTByte team for use in RTByte.
const { Argument, util: { regExpEsc } } = require('klasa');
const { Role } = require('discord.js');

const ROLE_REGEXP = Argument.regex.role;

function resolveRole(query, guild) {
	if (query instanceof Role) return guild.roles.cache.has(query.id) ? query : null;
	if (typeof query === 'string' && ROLE_REGEXP.test(query)) return guild.roles.cache.get(ROLE_REGEXP.exec(query)[1]);
	return null;
}

module.exports = class extends Argument {

	async run(arg, possible, msg) {
		if (!msg.guild) return this.store.get('role').run(arg, possible, msg);
		const resRole = resolveRole(arg, msg.guild);
		if (resRole) return resRole;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const role of msg.guild.roles.cache.values()) { if (reg.test(role.name)) results.push(role); }

		let querySearch;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(role => regWord.test(role.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw msg.language.get('ARG_ROLENAME_INVALID', possible.name);
			case 1: return querySearch[0];
			default:
				if (querySearch[0].name.toLowerCase() === arg.toLowerCase()) return querySearch[0];
				throw msg.language.get('ARG_ROLENAME_MULTIPLE', querySearch);
		}
	}

};
