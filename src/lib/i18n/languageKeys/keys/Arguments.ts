import { FT } from '#lib/types';

export const GuildChannelError = FT<{ parameter: string }>('arguments:guildChannelError');
export const GuildChannelMissingGuildError = FT<{ parameter: string }>('arguments:guildChannelMissingGuildError');
export const UserError = FT<{ parameter: string }>('arguments:userError');
