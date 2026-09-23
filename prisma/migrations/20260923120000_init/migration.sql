-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "youtubeChannelId" TEXT NOT NULL,
    "googleEmail" TEXT NOT NULL,
    "riotId" TEXT NOT NULL,
    "discordJoined" BOOLEAN NOT NULL DEFAULT false,
    "instagramFollowed" BOOLEAN NOT NULL DEFAULT false,
    "facebookFollowed" BOOLEAN NOT NULL DEFAULT false,
    "giveawayAnswer" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_youtubeChannelId_key" ON "Participant"("youtubeChannelId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_riotId_key" ON "Participant"("riotId");

-- CreateIndex
CREATE INDEX "Participant_createdAt_idx" ON "Participant"("createdAt");
