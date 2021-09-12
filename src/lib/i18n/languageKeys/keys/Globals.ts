import { FT, T } from '#lib/types';

export const AndListValue = FT<{ value: string[] }, string>('globals:andListValue');
export const DateFormat = T<string>('globals:dateFormat');
export const DateFormatExplanation = T<string>('globals:dateFormatExplanation');
export const DateValue = FT<{ value: number }, string>('globals:dateValue');
export const DateTimeValue = FT<{ value: number }, string>('globals:dateTimeValue');
export const DurationValue = FT<{ value: number }, string>('globals:durationValue');
export const EmbedRequestedBy = FT<{ requester: string}, string>('globals:embeds.requestedBy');
export const No = T<string>('globals:no');
export const None = T<string>('globals:none');
export const NumberCompactValue = FT<{ value: number }, string>('globals:numberCompactValue');
export const NumberValue = FT<{ value: number }, string>('globals:numberValue');
export const OrdinalValue = FT<{ value: string }, string>('globals:ordinalValue');
export const OrListValue = FT<{ value: string[] }, string>('globals:orListValue');
export const Unknown = T<string>('globals:unknown');
export const Yes = T<string>('globals:yes');
