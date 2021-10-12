import { FT, T } from "#lib/types";

export const AnyoneCanUnarchive = T<string>('events/guilds-logs:threads.anyoneCanUnarchive');
export const AutoArchiveDuration = T<string>('events/guilds-logs:threads.autoArchiveDuration');
export const AvatarChanged = T<string>('events/guilds-logs:webhooks.avatarChanged');
export const BitrateChanged = T<string>('events/guilds-logs:channels.bitrateChanged');
export const BotAdded = FT<{ by: string }, string>('events/guilds-logs:members.botAdded');
export const BotLeft = T<string>('events/guilds-logs:members.botLeft');
export const BotUpdated = FT<{ by: string }, string>('events/guilds-logs:members.botUpdated');
export const CategoryCreated = FT<{ by: string }, string>('events/guilds-logs:channels.categoryCreated');
export const CategoryDeleted = FT<{ by: string }, string>('events/guilds-logs:channels.categoryDeleted');
export const CategoryUpdated = FT<{ by: string }, string>('events/guilds-logs:channels.categoryUpdated');
export const ChangeLongText = FT<{ before: string, after: string }, string>('events/guilds-logs:shared.changeLongText');
export const ChangeShortObject = FT<{ before: string, after: string }, string>('events/guilds-logs:shared.changeShortObject');
export const ChangeShortText = FT<{ before: string, after: string }, string>('events/guilds-logs:shared.changeShortText');
export const ChannelChanged = T<string>('events/guilds-logs:webhooks.channelChanged');
export const ChannelCreated = FT<{ by: string }, string>('events/guilds-logs:channels.channelCreated');
export const ChannelDeleted = FT<{ by: string }, string>('events/guilds-logs:channels.channelDeleted');
export const ChannelUpdated = FT<{ by: string }, string>('events/guilds-logs:channels.channelUpdated');
export const ColorChanged = T<string>('events/guilds-logs:roles.colorChanged');
export const DefaultAutoArchiveThreadDuration = T<string>('events/guilds-logs:channels.defaultAutoArchiveThreadDuration');
export const DescriptionChanged = T<string>('events/guilds-logs:shared.descriptionChanged');
export const DisplayNameChanged = T<string>('events/guilds-logs:members.displayNameChanged');
export const EmojiCreated = FT<{ by: string }, string>('events/guilds-logs:emojis.emojiCreated');
export const EmojiDeleted = FT<{ by: string }, string>('events/guilds-logs:emojis.emojiDeleted');
export const EmojiUpdated = FT<{ by: string }, string>('events/guilds-logs:emojis.emojiUpdated');
export const Expiry = T<string>('events/guilds-logs:invites.expiry');
export const HoistToggled = T<string>('events/guilds-logs:roles.hoistToggled');
export const InviteCreated = FT<{ by: string }, string>('events/guilds-logs:invites.inviteCreated');
export const InviteDeleted = FT<{ by: string }, string>('events/guilds-logs:invites.inviteDeleted');
export const MaxUses = T<string>('events/guilds-logs:invites.maxUses');
export const MembersOnly = T<string>('events/guilds-logs:stages.membersOnly');
export const MentionableToggled = T<string>('events/guilds-logs:roles.mentionableToggled');
export const MessageDeleted = T<string>('events/guilds-logs:messages.messageDeleted');
export const MessageUpdated = T<string>('events/guilds-logs:messages.messageUpdated');
export const NameChanged = T<string>('events/guilds-logs:shared.nameChanged');
export const NoContentBeforeEdit = T<string>('events/guilds-logs:messages.noContentBeforeEdit');
export const NewsChannelCreated = FT<{ by: string }, string>('events/guilds-logs:channels.newsChannelCreated');
export const NewsChannelDeleted = FT<{ by: string }, string>('events/guilds-logs:channels.newsChannelDeleted');
export const NewsChannelUpdated = FT<{ by: string }, string>('events/guilds-logs:channels.newsChannelUpdated');
export const NSFWToggled = T<string>('events/guilds-logs:channels.nsfwToggled');
export const ParentChanged = T<string>('events/guilds-logs:channels.parentChanged');
export const PermissionsChanged = T<string>('events/guilds-logs:roles.permissionsChanged');
export const PermissionsFormatted = FT<{ before: string[], after: string[] }, string>('events/guilds-logs:roles.permissionsFormatted');
export const Privacy = T<string>('events/guilds-logs:stages.privacy');
export const PrivacyChanged = T<string>('events/guilds-logs:stages.privacyChanged');
export const Public = T<string>('events/guilds-logs:stages.public');
export const RegionOverrideChanged = T<string>('events/guilds-logs:channels.regionOverrideChanged');
export const RegionOverrideFormatted = FT<{ before: string, after: string }, string>('events/guilds-logs:channels.regionOverrideFormatted');
export const RelatedEmoji = T<string>('events/guilds-logs:stickers.relatedEmoji');
export const RelatedEmojiChanged = T<string>('events/guilds-logs:stickers.relatedEmojiChanged');
export const RoleCreated = FT<{ by: string }, string>('events/guilds-logs:roles.roleCreated');
export const RoleDeleted = FT<{ by: string }, string>('events/guilds-logs:roles.roleDeleted');
export const RoleUpdated = FT<{ by: string }, string>('events/guilds-logs:roles.roleUpdated');
export const SlowmodeChanged = T<string>('events/guilds-logs:channels.slowmodeChanged');
export const StageChannelCreated = FT<{ by: string }, string>('events/guilds-logs:channels.stageChannelCreated');
export const StageChannelDeleted = FT<{ by: string }, string>('events/guilds-logs:channels.stageChannelDeleted');
export const StageChannelUpdated = FT<{ by: string }, string>('events/guilds-logs:channels.stageChannelUpdated');
export const StageInstanceCreated = FT<{ by: string }, string>('events/guilds-logs:stages.stageInstanceCreated');
export const StageInstanceDeleted = FT<{ by: string }, string>('events/guilds-logs:stages.stageInstanceDeleted');
export const StageInstanceUpdated = FT<{ by: string }, string>('events/guilds-logs:stages.stageInstanceUpdated');
export const StickerCreated = FT<{ by: string }, string>('events/guilds-logs:stickers.stickerCreated');
export const StickerDeleted = FT<{ by: string }, string>('events/guilds-logs:stickers.stickerDeleted');
export const StickerUpdated = FT<{ by: string }, string>('events/guilds-logs:stickers.stickerUpdated');
export const StoreChannelCreated = FT<{ by: string }, string>('events/guilds-logs:channels.storeChannelCreated');
export const StoreChannelDeleted = FT<{ by: string }, string>('events/guilds-logs:channels.storeChannelDeleted');
export const StoreChannelUpdated = FT<{ by: string }, string>('events/guilds-logs:channels.storeChannelUpdated');
export const Temporary = T<string>('events/guilds-logs:invites.temporary');
export const ThreadArchived = FT<{ by: string }, string>('events/guilds-logs:threads.threadArchived');
export const ThreadCreated = FT<{ by: string }, string>('events/guilds-logs:threads.threadCreated');
export const ThreadDeleted = FT<{ by: string }, string>('events/guilds-logs:threads.threadDeleted');
export const ThreadUnarchived = FT<{ by: string }, string>('events/guilds-logs:threads.threadUnarchived');
export const ThreadUpdated = FT<{ by: string }, string>('events/guilds-logs:threads.threadUpdated');
export const TopicChanged = T<string>('events/guilds-logs:shared.topicChanged');
export const TypeChanged = T<string>('events/guilds-logs:channels.typeChanged');
export const TypeFormatted = FT<{ before: string, after: string}, string>('events/guilds-logs:channels.typeFormatted');
export const UserJoined = T<string>('events/guilds-logs:members.userJoined');
export const UserLeft = T<string>('events/guilds-logs:members.userLeft');
export const UserLimitChanged = T<string>('events/guilds-logs:channels.userLimitChanged');
export const UserLimitFormatted = FT<{ users: number }, string>('events/guilds-logs:channels.userLimitFormatted');
export const UserUpdated = FT<{ by: string }, string>('events/guilds-logs:members.userUpdated');
export const VoiceChannelCreated = FT<{ by: string }, string>('events/guilds-logs:channels.voiceChannelCreated');
export const VoiceChannelDeleted = FT<{ by: string }, string>('events/guilds-logs:channels.voiceChannelDeleted');
export const VoiceChannelUpdated = FT<{ by: string }, string>('events/guilds-logs:channels.voiceChannelUpdated');
export const WebhookCreated = FT<{ by: string }, string>('events/guilds-logs:webhooks.webhookCreated');
export const WebhookDeleted = FT<{ by: string }, string>('events/guilds-logs:webhooks.webhookDeleted');
export const WebhookUpdated = FT<{ by: string }, string>('events/guilds-logs:webhooks.webhookUpdated');
