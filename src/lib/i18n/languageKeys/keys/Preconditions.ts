import { FT, T } from '#lib/types';

// Sapphire built-in preconditions
export const ClientPermissions = FT<{ missing: string[] }>('preconditions:clientPermissions');
export const Cooldown = FT<{ remaining: number }>('preconditions:cooldown');
export const DisabledGlobal = T('preconditions:disabledGlobal');
export const DMOnly = T('preconditions:dmOnly');
export const GuildNewsOnly = T('preconditions:guildNewsOnly');
export const GuildNewsThreadOnly = T('preconditions:guildNewsThreadOnly');
export const GuildOnly = T('preconditions:guildOnly');
export const GuildPrivateThreadOnly = T('preconditions:guildPrivateThreadOnly');
export const GuildPublicThreadOnly = T('preconditions:guildPublicThreadOnly');
export const GuildTextOnly = T('preconditions:guildTextOnly');
export const NSFW = T('preconditions:nsfw');
export const ThreadOnly = T('preconditions:threadOnly');
export const UserPermissions = T('preconditions:userPermissions');

// RTByte preconditions
export const Administrator = T('preconditions:administrator');
export const Moderator = T('preconditions:moderator');
export const ServerOwner = T('preconditions:serverOwner');
