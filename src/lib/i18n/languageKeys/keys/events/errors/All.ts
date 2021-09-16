import { FT } from '#lib/types';

export const String = FT<{ mention: string; message: string }, string>('events/errors:string');
