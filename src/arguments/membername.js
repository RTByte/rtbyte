// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
// Modified by the RTByte team for use in RTByte.
const { Argument, util: { regExpEsc } } = require('klasa');
const { GuildMember, User } = require('discord.js');

const USER_REGEXP = Argument.regex.userOrMember;

function resolveMember(query, guild) {
	if (query instanceof GuildMember) return query;
	if (query instanceof User) return guild.members.fetch(query.id);
	if (typeof query === 'string') {
		if (USER_REGEXP.test(query)) return guild.members.fetch(USER_REGEXP.exec(query)[1]).catch(() => null);
		if (/\w{1,32}#\d{4}/.test(query)) {
			const res = guild.members.cache.find(member => member.user.tag.toLowerCase() === query.toLowerCase());
			return res || null;
		}
	}
	return null;
}

module.exports = class extends Argument {

	async run(arg, possible, msg) {
		if (!msg.guild) throw msg.language.get('ARG_MEMBERNAME_NOT_GUILD');
		const resUser = await resolveMember(arg, msg.guild);
		if (resUser) return resUser;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const member of msg.guild.members.cache.values()) {
			if (reg.test(member.user.username)) results.push(member);
		}

		let querySearch;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(member => regWord.test(member.user.username));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw msg.language.get('ARG_MEMBERNAME_INVALID', possible.name);
			case 1: return querySearch[0];
			default: throw msg.language.get('ARG_MEMBERNAME_MULTIPLE', querySearch);
		}
	}

};
