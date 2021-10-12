/*
The code in this file is licensed under the Apache License,
Version 2.0 (the "License"); with the original authors being part of the
Skyra Project (https://github.com/skyra-project/skyra) team.
*/

import type { Handler } from '#lib/i18n/structures/Handler';
import { ExtendedHandler as BgBgHandler } from './bg-BG/constants';
import { ExtendedHandler as CsCzHandler } from './cs-CZ/constants';
import { ExtendedHandler as DaDkHandler } from './da-DK/constants';
import { ExtendedHandler as DeDeHandler } from './de-DE/constants';
import { ExtendedHandler as ElGrHandler } from './el-GR/constants';
import { ExtendedHandler as EnUsHandler } from './en-US/constants';
import { ExtendedHandler as EsEsHandler } from './es-ES/constants';
import { ExtendedHandler as FiFiHandler } from './fi-FI/constants';
import { ExtendedHandler as FrFrHandler } from './fr-FR/constants';
import { ExtendedHandler as HiInHandler } from './hi-IN/constants';
import { ExtendedHandler as HrHrHandler } from './hr-HR/constants';
import { ExtendedHandler as HuHuHandler } from './hu-HU/constants';
import { ExtendedHandler as ItItHandler } from './it-IT/constants';
import { ExtendedHandler as JaJpHandler } from './ja-JP/constants';
import { ExtendedHandler as KoKrHandler } from './ko-KR/constants';
import { ExtendedHandler as LtLtHandler } from './lt-LT/constants';
import { ExtendedHandler as NbNoHandler } from './nb-NO/constants';
import { ExtendedHandler as NlNlHandler } from './nl-NL/constants';
import { ExtendedHandler as PlPlHandler } from './pl-PL/constants';
import { ExtendedHandler as PtBrHandler } from './pt-BR/constants';
import { ExtendedHandler as RoRoHandler } from './ro-RO/constants';
import { ExtendedHandler as RuRuHandler } from './ru-RU/constants';
import { ExtendedHandler as SvSeHandler } from './sv-SE/constants';
import { ExtendedHandler as ThThHandler } from './th-TH/constants';
import { ExtendedHandler as TrTrHandler } from './tr-TR/constants';
import { ExtendedHandler as UkUaHandler } from './uk-UA/constants';
import { ExtendedHandler as ViVnHandler } from './vi-VN/constants';
import { ExtendedHandler as ZhCnHandler } from './zh-CN/constants';

export const handlers = new Map<string, Handler>([
	['bg-BG', new BgBgHandler()],
	['cs-CZ', new CsCzHandler()],
	['da-DK', new DaDkHandler()],
	['de-DE', new DeDeHandler()],
	['el-GR', new ElGrHandler()],
	['en-US', new EnUsHandler()],
	['es-ES', new EsEsHandler()],
	['fi-FI', new FiFiHandler()],
	['fr-FR', new FrFrHandler()],
	['hi-IN', new HiInHandler()],
	['hr-HR', new HrHrHandler()],
	['hu-HU', new HuHuHandler()],
	['it-IT', new ItItHandler()],
	['ja-JP', new JaJpHandler()],
	['ko-KR', new KoKrHandler()],
	['lt-LT', new LtLtHandler()],
	['nb-NO', new NbNoHandler()],
	['nl-NL', new NlNlHandler()],
	['pl-PL', new PlPlHandler()],
	['pt-BR', new PtBrHandler()],
	['ro-RO', new RoRoHandler()],
	['ru-RU', new RuRuHandler()],
	['sv-SE', new SvSeHandler()],
	['th-TH', new ThThHandler()],
	['tr-TR', new TrTrHandler()],
	['uk-UA', new UkUaHandler()],
	['vi-VN', new ViVnHandler()],
	['zh-CN', new ZhCnHandler()]
]);

export function getHandler(name: string): Handler {
	return handlers.get(name) ?? handlers.get('en-US')!;
}
