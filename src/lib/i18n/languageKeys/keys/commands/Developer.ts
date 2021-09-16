import { FT, T } from '#lib/types';

export const EvalDescription = T<string>('commands/developer:eval.description');
export const EvalError = FT<{ time: string; output: string; type: string }, string>('commands/developer:eval.responses.error');
export const EvalTimeout = FT<{ seconds: number }, string>('commands/developer:eval.responses.timeout');
