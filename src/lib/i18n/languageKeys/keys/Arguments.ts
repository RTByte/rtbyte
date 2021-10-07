import { FT, T } from '#lib/types';

export const GuildChannelError = FT<{ parameter: string }>('arguments:guildChannelError');
export const GuildChannelMissingGuildError = FT<{ parameter: string }>('arguments:guildChannelMissingGuildError');
export const MessageError = FT<{ parameter: string }>('arguments:messageError');
export const Missing = T('arguments:missing');
export const UserError = FT<{ parameter: string }>('arguments:userError');
