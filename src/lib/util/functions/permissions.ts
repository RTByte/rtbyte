import { Guild } from ".prisma/client";
import { GuildMember, Permissions } from "discord.js";

export async function isModerator(member: GuildMember) {
	const guildSettings = await member.client.prisma.guild.findFirst({ where: { guildID: member.guild.id } });

	return isGuildOwner(member) || checkModerator(member, guildSettings) || checkAdministrator(member, guildSettings);
}

export async function isAdmin(member: GuildMember) {
	const guildSettings = await member.client.prisma.guild.findFirst({ where: { guildID: member.guild.id } });

	return isGuildOwner(member) || checkAdministrator(member, guildSettings);
}

export function isGuildOwner(member: GuildMember) {
	return member.id === member.guild.ownerId;
}

function checkModerator(member: GuildMember, settings: Guild | null) {
	return settings?.modRole ? member.roles.cache.has(String(settings?.modRole)) : member.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
}

function checkAdministrator(member: GuildMember, settings: Guild | null) {
	return settings?.adminRole ? member.roles.cache.has(String(settings?.adminRole)) : member.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
}
