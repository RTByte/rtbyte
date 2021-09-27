-- AlterTable
ALTER TABLE "guild" ADD COLUMN     "log_webhook_create" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "log_webhook_delete" BOOLEAN NOT NULL DEFAULT false;
