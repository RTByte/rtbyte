import { FT, T } from '#lib/types';

export const ClickToView = T<string>('system:clickToView');
export const DiscordAbortError = T('system:discordAbortError');
export const ExceededLengthChooseOutput = FT<{ output: string[] }>('system:exceededLength.chooseOutput');
export const ExceededLengthOutput = FT<{ output: string }>('system:exceededLength.output');
export const ExceededLengthOutputConsole = T('system:exceededLength.outputConsole');
export const ExceededLengthOutputFile = T('system:exceededLength.outputFile');
export const ExceededLengthOutputTime = FT<{ time: string }>('system:exceededLength.outputTime');
export const ExceededLengthOutputType = FT<{ type: string }>('system:exceededLength.outputType');
export const RequestedBy = FT<{ requester: string}, string>('system:requestedBy');
