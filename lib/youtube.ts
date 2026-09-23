import { google, youtube_v3 } from "googleapis";

function createYouTubeClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  return google.youtube({
    version: "v3",
    auth: oauth2Client
  });
}

export async function getAuthenticatedYouTubeAccount(accessToken: string) {
  const youtube = createYouTubeClient(accessToken);
  const response = await youtube.channels.list({
    part: ["id", "snippet"],
    mine: true,
    maxResults: 1
  });
  const channel = response.data.items?.[0];

  if (!channel?.id) {
    throw new Error("No YouTube channel found for this Google account.");
  }

  return {
    channelId: channel.id,
    youtube
  };
}

export async function isSubscribedToChannel(
  youtube: youtube_v3.Youtube,
  channelId: string
) {
  const response = await youtube.subscriptions.list({
    part: ["snippet"],
    mine: true,
    forChannelId: channelId,
    maxResults: 1
  });

  return Boolean(response.data.items?.length);
}
