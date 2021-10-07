-- AlterTable
ALTER TABLE "guild" ADD COLUMN     "log_stage_instance_create" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "log_stage_instance_delete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "log_stage_instance_update" BOOLEAN NOT NULL DEFAULT false;
