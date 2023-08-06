/*
  Warnings:

  - You are about to drop the column `log_channel` on the `guild` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "guild" DROP COLUMN "log_channel";

-- CreateTable
CREATE TABLE "guild_logs" (
    "guild_id" TEXT NOT NULL,
    "log_channel" TEXT,
    "logs_enabled" BOOLEAN NOT NULL DEFAULT false,
    "logs_channels" BOOLEAN NOT NULL DEFAULT true,
    "logs_emoji" BOOLEAN NOT NULL DEFAULT true,
    "logs_members" BOOLEAN NOT NULL DEFAULT true,
    "logs_events" BOOLEAN NOT NULL DEFAULT false,
    "logs_guild" BOOLEAN NOT NULL DEFAULT true,
    "logs_invites" BOOLEAN NOT NULL DEFAULT false,
    "logs_messages" BOOLEAN NOT NULL DEFAULT true,
    "logs_roles" BOOLEAN NOT NULL DEFAULT true,
    "logs_stages" BOOLEAN NOT NULL DEFAULT false,
    "logs_stickers" BOOLEAN NOT NULL DEFAULT true,
    "logs_threads" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "guild_logs_pkey" PRIMARY KEY ("guild_id")
);

-- AddForeignKey
ALTER TABLE "guild_logs" ADD CONSTRAINT "guild_logs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
