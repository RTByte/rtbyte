import { getPermissionString } from "#utils/util";
import { GuildMember, PermissionsBitField } from "discord.js";

export function isModerator(member: GuildMember) {
	return isGuildOwner(member) || checkModerator(member) || checkAdministrator(member);
}

export function isAdmin(member: GuildMember) {
	return isGuildOwner(member) || checkAdministrator(member);
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerId;
}

export function checkRoleHierarchy(member: GuildMember, executor: GuildMember) {
	return member.roles.highest.position < executor.roles.highest.position;
}

function checkModerator(member: GuildMember) {
	return member.permissions.has(PermissionsBitField.Flags.KickMembers);
}

function checkAdministrator(member: GuildMember) {
	return member.permissions.has(PermissionsBitField.Flags.ManageGuild);
}

export function getPermissionDifference(oldPermissions: PermissionsBitField, permissions: PermissionsBitField) {
	const added = oldPermissions.missing(permissions).map(perm => getPermissionString(perm));
	const removed = permissions.missing(oldPermissions).map(perm => getPermissionString(perm));
	const differences = {
		added,
		removed
	}

	return differences;
}