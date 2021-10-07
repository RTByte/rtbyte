import { Identifiers } from "@sapphire/framework";
import { LanguageKeys } from "./languageKeys";


export function translate(identifier: string): string {
	switch (identifier) {
		case Identifiers.ArgumentMessageError:
			return `arguments:${identifier}`;
		case Identifiers.ArgsMissing:
			return LanguageKeys.Arguments.Missing;
		case Identifiers.PreconditionClientPermissions:
			return LanguageKeys.Preconditions.ClientPermissions;
		case Identifiers.PreconditionCooldown:
			return LanguageKeys.Preconditions.Cooldown;
		case Identifiers.CommandDisabled:
			return LanguageKeys.Preconditions.DisabledGlobal;
		case Identifiers.PreconditionDMOnly:
			return LanguageKeys.Preconditions.DMOnly;
		case Identifiers.PreconditionGuildNewsOnly:
			return LanguageKeys.Preconditions.GuildNewsOnly;
		case Identifiers.PreconditionGuildNewsThreadOnly:
			return LanguageKeys.Preconditions.GuildNewsThreadOnly;
		case Identifiers.PreconditionGuildOnly:
			return LanguageKeys.Preconditions.GuildOnly;
		case Identifiers.PreconditionGuildPrivateThreadOnly:
			return LanguageKeys.Preconditions.GuildPrivateThreadOnly;
		case Identifiers.PreconditionGuildPublicThreadOnly:
			return LanguageKeys.Preconditions.GuildPublicThreadOnly;
		case Identifiers.PreconditionGuildTextOnly:
			return LanguageKeys.Preconditions.GuildTextOnly;
		case Identifiers.PreconditionNSFW:
			return LanguageKeys.Preconditions.NSFW;
		case Identifiers.PreconditionThreadOnly:
			return LanguageKeys.Preconditions.ThreadOnly;
		case Identifiers.PreconditionUserPermissions:
			return LanguageKeys.Preconditions.UserPermissions;
		default:
			return identifier;
	}
}
