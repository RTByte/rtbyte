-- CreateTable
CREATE TABLE "client" (
    "client_id" TEXT NOT NULL,
    "user_blacklist" TEXT[],
    "guild_blacklist" TEXT[],

    PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "guild" (
    "guild_id" TEXT NOT NULL,
    "prefix" TEXT DEFAULT E'-',
    "language" TEXT NOT NULL DEFAULT E'en-US',
    "measurement_units" TEXT NOT NULL DEFAULT E'metric',
    "timezone" TEXT NOT NULL DEFAULT E'Europe/London',
    "moderator_role" TEXT,
    "administrator_role" TEXT,
    "muted_role" TEXT,
    "vc_banned_role" TEXT,
    "joinable_roles" TEXT[],
    "log_channel" TEXT,
    "filters_blacklist" BOOLEAN NOT NULL DEFAULT false,
    "filters_anti_invite" BOOLEAN NOT NULL DEFAULT false,
    "filters_mention_spam" BOOLEAN NOT NULL DEFAULT false,
    "filters_blacklist_punishment" TEXT,
    "filters_anti_invite_punishment" TEXT,
    "filters_mention_spam_punishment" TEXT,
    "filters_mod_bypass" BOOLEAN NOT NULL DEFAULT true,
    "filters_delete_offending" BOOLEAN NOT NULL DEFAULT true,
    "filters_check_display_names" BOOLEAN NOT NULL DEFAULT true,
    "filters_word_blacklist" TEXT[],
    "filters_invite_whitelist" TEXT[],
    "filters_mention_spam_threshold" INTEGER NOT NULL DEFAULT 12,
    "greetings_welcome_users" BOOLEAN NOT NULL DEFAULT false,
    "greetings_welcome_channel" TEXT,
    "greetings_welcome_message" TEXT,
    "greetings_dismiss_users" BOOLEAN NOT NULL DEFAULT false,
    "greetings_dismiss_channel" TEXT,
    "greetings_dismiss_message" TEXT,
    "log_channel_create" BOOLEAN NOT NULL DEFAULT false,
    "log_channel_delete" BOOLEAN NOT NULL DEFAULT false,
    "log_channel_update" BOOLEAN NOT NULL DEFAULT false,
    "log_emoji_create" BOOLEAN NOT NULL DEFAULT false,
    "log_emoji_delete" BOOLEAN NOT NULL DEFAULT false,
    "log_emoji_update" BOOLEAN NOT NULL DEFAULT false,
    "log_guild_member_join" BOOLEAN NOT NULL DEFAULT true,
    "log_guild_member_leave" BOOLEAN NOT NULL DEFAULT true,
    "log_guild_member_update" BOOLEAN NOT NULL DEFAULT true,
    "log_guild_update" BOOLEAN NOT NULL DEFAULT true,
    "log_invite_create" BOOLEAN NOT NULL DEFAULT false,
    "log_invite_delete" BOOLEAN NOT NULL DEFAULT false,
    "log_message_delete" BOOLEAN NOT NULL DEFAULT false,
    "log_message_update" BOOLEAN NOT NULL DEFAULT false,
    "log_role_create" BOOLEAN NOT NULL DEFAULT false,
    "log_role_delete" BOOLEAN NOT NULL DEFAULT false,
    "log_role_update" BOOLEAN NOT NULL DEFAULT false,
    "log_sticker_create" BOOLEAN NOT NULL DEFAULT false,
    "log_sticker_delete" BOOLEAN NOT NULL DEFAULT false,
    "log_sticker_update" BOOLEAN NOT NULL DEFAULT false,
    "log_thread_create" BOOLEAN NOT NULL DEFAULT false,
    "log_thread_delete" BOOLEAN NOT NULL DEFAULT false,
    "log_thread_members_update" BOOLEAN NOT NULL DEFAULT false,
    "log_thread_update" BOOLEAN NOT NULL DEFAULT false,
    "log_webhook_update" BOOLEAN NOT NULL DEFAULT false,
    "moderation_notify_user" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_ban" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_unban" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_kick" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_mute" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_unmute" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_purge" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_softban" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_vc_ban" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_vc_unban" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_vc_kick" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_anti_invite" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_mention_spam" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_blacklisted_word" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_blacklisted_name" BOOLEAN NOT NULL DEFAULT true,
    "mod_log_warn" BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY ("guild_id")
);