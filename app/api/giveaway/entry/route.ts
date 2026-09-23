import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedYouTubeAccount,
  isSubscribedToChannel
} from "@/lib/youtube";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const MAX_RIOT_ID_LENGTH = 100;
const MAX_ANSWER_LENGTH = 500;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, code, message }, { status });
}

export async function POST(request: Request) {
  const session = await auth();
  const accessToken = session?.accessToken;
  const googleEmail = session?.user?.email;

  if (!accessToken || !googleEmail) {
    return errorResponse(
      "NOT_AUTHENTICATED",
      "Please sign in with Google before entering the giveaway.",
      401
    );
  }

  const configuredChannelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!configuredChannelId || !/^UC[\w-]{22}$/.test(configuredChannelId)) {
    return errorResponse(
      "CHANNEL_ID_NOT_CONFIGURED",
      "The giveaway YouTube channel is not configured correctly.",
      500
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body.", 400);
  }

  if (!body || typeof body !== "object") {
    return errorResponse("INVALID_INPUT", "Invalid entry data.", 400);
  }

  const input = body as Record<string, unknown>;
  const riotId = typeof input.riotId === "string" ? input.riotId.trim() : "";
  const giveawayAnswer =
    typeof input.giveawayAnswer === "string"
      ? input.giveawayAnswer.trim()
      : "";
  const discordJoined = input.discordJoined;
  const instagramFollowed = input.instagramFollowed;
  const facebookFollowed = input.facebookFollowed;

  if (!riotId || riotId.length > MAX_RIOT_ID_LENGTH) {
    return errorResponse(
      "INVALID_RIOT_ID",
      `Riot ID is required and must be ${MAX_RIOT_ID_LENGTH} characters or fewer.`,
      400
    );
  }

  if (!giveawayAnswer || giveawayAnswer.length > MAX_ANSWER_LENGTH) {
    return errorResponse(
      "INVALID_ANSWER",
      `Giveaway answer is required and must be ${MAX_ANSWER_LENGTH} characters or fewer.`,
      400
    );
  }

  if (
    typeof discordJoined !== "boolean" ||
    typeof instagramFollowed !== "boolean" ||
    typeof facebookFollowed !== "boolean"
  ) {
    return errorResponse(
      "INVALID_SOCIAL_CONFIRMATION",
      "Social confirmations must be true or false.",
      400
    );
  }

  if (!discordJoined || !instagramFollowed || !facebookFollowed) {
    return errorResponse(
      "REQUIREMENTS_NOT_COMPLETED",
      "Please complete all social steps before submitting your entry.",
      400
    );
  }

  try {
    const { channelId, youtube } = await getAuthenticatedYouTubeAccount(
      accessToken
    );
    const subscribed = await isSubscribedToChannel(
      youtube,
      configuredChannelId
    );

    if (!subscribed) {
      return errorResponse(
        "SUBSCRIPTION_NOT_VERIFIED",
        "YouTube subscription could not be verified.",
        403
      );
    }

    const entryLimit = Math.max(
      1,
      Number.parseInt(process.env.GIVEAWAY_ENTRY_LIMIT ?? "100", 10) || 100
    );

    const participant = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRaw(
        Prisma.sql`SELECT pg_advisory_xact_lock(hashtext('sktechgamer-giveaway-entry-limit'))`
      );

      const existing = await transaction.participant.findFirst({
        where: {
          OR: [{ youtubeChannelId: channelId }, { riotId }]
        },
        select: { youtubeChannelId: true, riotId: true }
      });

      if (existing?.youtubeChannelId === channelId) {
        throw new Error("ALREADY_REGISTERED");
      }
      if (existing?.riotId === riotId) {
        throw new Error("RIOT_ID_ALREADY_REGISTERED");
      }

      const count = await transaction.participant.count();
      if (count >= entryLimit) {
        throw new Error("ENTRY_LIMIT_REACHED");
      }

      return transaction.participant.create({
        data: {
          youtubeChannelId: channelId,
          googleEmail,
          riotId,
          discordJoined,
          instagramFollowed,
          facebookFollowed,
          giveawayAnswer
        },
        select: { id: true }
      });
    });

    return NextResponse.json({
      success: true,
      message: "You are eligible for the giveaway!",
      participantId: participant.id
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ALREADY_REGISTERED") {
        return errorResponse(
          "ALREADY_REGISTERED",
          "This YouTube account has already registered for the giveaway.",
          409
        );
      }
      if (error.message === "RIOT_ID_ALREADY_REGISTERED") {
        return errorResponse(
          "RIOT_ID_ALREADY_REGISTERED",
          "This Riot ID is already registered.",
          409
        );
      }
      if (error.message === "ENTRY_LIMIT_REACHED") {
        return errorResponse(
          "ENTRY_LIMIT_REACHED",
          "The giveaway has reached its entry limit.",
          409
        );
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        "DUPLICATE_ENTRY",
        "This giveaway entry already exists.",
        409
      );
    }

    console.error("Giveaway entry failed:", error);
    return errorResponse(
      "ENTRY_FAILED",
      "We could not save your entry. Please try again.",
      500
    );
  }
}
