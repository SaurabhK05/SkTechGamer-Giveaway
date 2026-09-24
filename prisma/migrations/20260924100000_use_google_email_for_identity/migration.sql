ALTER TABLE "Participant" ALTER COLUMN "youtubeChannelId" DROP NOT NULL;

CREATE UNIQUE INDEX "Participant_googleEmail_key" ON "Participant"("googleEmail");