import { FT, T } from '#lib/types';

export const ClickToView = T<string>('system:clickToView');
export const DiscordAbortError = T('system:discordAbortError');
export const RequestedBy = FT<{ requester: string}, string>('system:requestedBy');
