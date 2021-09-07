import { join } from 'path';

export const rootFolder = join(__dirname, '..', '..', '..');

export const enum Colors {
	accent = '#FE3132',
	white = '#FEFEFE',
	red = '#FF4B4B',
	green = '#4BFF4B',
	yellow = '#FFFF4B',
	blue = '#4B4BFF',
	pink = '#F47FFF',
	gold = '#DAA520',
	purple = '#9046FF'
}

export const enum Emojis {
	Check = '<:check:801916142338834492>',
	X = '<:cross:801916142327169114>',
	ArrowLeft = '',
	ArrowRight = '',
	ArrowToLeft = '',
	ArrowToRight = '',
	Info = '',
	List = '',
	Online = '',
	Idle = '',
	Dnd = '',
	Offline = '',
	BotBadge = '',
	PartnerBadge = '',
	VerifiedBadge = ''
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
