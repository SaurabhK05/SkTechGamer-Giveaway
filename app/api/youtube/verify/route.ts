import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedYouTubeAccount,
  isSubscribedToChannel
} from "@/lib/youtube";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json(
      { ok: false, code: "NOT_AUTHENTICATED" },
      { status: 401 }
    );
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!channelId) {
    return NextResponse.json(
      { ok: false, code: "CHANNEL_ID_NOT_CONFIGURED" },
      { status: 500 }
    );
  }

  if (!/^UC[\w-]{22}$/.test(channelId)) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_CHANNEL_ID",
        message: "YOUTUBE_CHANNEL_ID must be the channel ID starting with UC."
      },
      { status: 500 }
    );
  }

  try {
    const { channelId: userChannelId, youtube } =
      await getAuthenticatedYouTubeAccount(
      session.accessToken
      );
    const subscribed = await isSubscribedToChannel(youtube, channelId);
    const alreadyRegistered = subscribed
      ? Boolean(
          await prisma.participant.findUnique({
            where: { youtubeChannelId: userChannelId },
            select: { id: true }
          })
        )
      : false;

    return NextResponse.json({
      ok: true,
      subscribed,
      alreadyRegistered,
      subscribeUrl: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL
    });
  } catch (error) {
    console.error("YouTube API verification failed:", error);
    return NextResponse.json(
      {
        ok: false,
        code: "YOUTUBE_API_ERROR",
        message: "YouTube verification failed."
      },
      { status: 500 }
    );
  }
}
