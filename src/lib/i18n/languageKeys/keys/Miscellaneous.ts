import { FT, T } from "#lib/types";

export const Automatic = <string>('miscellaneous:automatic');
export const By = FT<{ user: string}, string>('miscellaneous:by');
export const Category = T<string>('miscellaneous:category');
export const Directions = T<readonly string[]>('miscellaneous:directions');
export const DisplayID = FT<{ id: string }, string>('miscellaneous:id');
export const Joined = T<string>('miscellaneous:joined');
export const Message = T<string>('miscellaneous:message');
export const Registered = T<string>('miscellaneous:registered');
export const ServerCreator = T<string>('miscellaneous:serverCreator');
export const SpeedUnits = T<readonly string[]>('miscellaneous:speedUnits');
export const Unlimited = T<string>('miscellaneous:unlimited');
