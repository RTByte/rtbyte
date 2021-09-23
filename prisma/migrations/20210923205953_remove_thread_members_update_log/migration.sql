/*
  Warnings:

  - You are about to drop the column `log_thread_members_update` on the `guild` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "guild" DROP COLUMN "log_thread_members_update";
