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

export function getAuthenticatedYouTubeClient(accessToken: string) {
  return createYouTubeClient(accessToken);
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
