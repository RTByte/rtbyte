import { join } from 'path';

export const rootFolder = join(__dirname, '..', '..', '..');

export const ZeroWidthSpace = '\u200B';

export const enum Colors {
	Accent = '#FE3132',
	White = '#FEFEFE',
	Red = '#FF4B4B',
	Green = '#4BFF4B',
	Yellow = '#FFFF4B',
	Blue = '#4B4BFF',
	Pink = '#F47FFF',
	Gold = '#DAA520',
	Purple = '#9046FF'
}

export const enum Emojis {
	ArrowLeft = '<:rtbyte_arrow_left:801917830710558790>',
	ArrowRight = '<:rtbyte_arrow_right:801918001124212837>',
	ArrowToLeft = '<:rtbyte_arrow_to_left:801918098571395133>',
	ArrowToRight = '<:rtbyte_arrow_to_right:801918207077777409>',
	BotBadge = '<:rtbyte_bot_badge:801919189664399391>',
	Check = '<:check:801916142338834492>',
	Dnd = '<:rtbyte_dnd:801918926417559552>',
	Idle = '<:rtbyte_idle:801918753679212544>',
	Info = '<:rtbyte_info:801918407023919124>',
	List = '<:rtbyte_list:801918507666374679>',
	Offline = '<:rtbyte_offline:801919060303806504>',
	Online = '<:rtbyte_online:801918663233241099>',
	PartnerBadge = '<:rtbyte_partnered_badge:801919416429838366>',
	VerifiedBadge = '<:rtbyte_verified_badge:801919582696505364>',
	X = '<:cross:801916142327169114>',
}

export const enum LanguageFormatters {
	AndList = 'andList',
	Duration = 'duration',
	ExplicitContentFilter = 'explicitContentFilter',
	MessageNotifications = 'messageNotifications',
	Number = 'number',
	NumberCompact = 'numberCompact',
	HumanLevels = 'humanLevels',
	InlineCodeblock = 'inlineCodeBlock',
	CodeBlock = 'codeBlock',
	JsCodeBlock = 'jsCodeBlock',
	Ordinal = 'ordinal',
	OrList = 'orList',
	Permissions = 'permissions',
	Random = 'random',
	Date = 'date',
	DateFull = 'dateFull',
	DateTime = 'dateTime',
	ToTitleCase = 'toTitleCase',
	PermissionsAndList = 'permissionsAndList'
}

export const REGEX = {
	emoji: /^(?:<a?:\w{2,32}:)?(\d{17,19})>?$/,
	emojiAnimated: /^<a:(?:\w{2,32}:)?(\d{17,19})>?$/
};

export const RandomLoadingMessage = ['Loading...', 'Working on it...', 'Hang on...'];
