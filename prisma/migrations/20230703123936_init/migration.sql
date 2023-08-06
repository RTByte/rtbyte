-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "restarts" INTEGER NOT NULL DEFAULT 0,
    "last_restart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guild_blacklist" TEXT[],

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild" (
    "id" TEXT NOT NULL,
    "log_channel" TEXT,
    "joinable_roles" TEXT[],

    CONSTRAINT "guild_pkey" PRIMARY KEY ("id")
);
