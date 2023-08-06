-- AlterTable
ALTER TABLE "guild" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "member" (
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "times_joined" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "member_pkey" PRIMARY KEY ("user_id","guild_id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "previous_usernames" TEXT[],

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;
