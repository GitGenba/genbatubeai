import { VideoResult } from "@/types/index";
import {
  parseDuration,
  isShort,
  getDateTwoYearsAgo,
  buildVideoUrl,
  buildChannelUrl,
} from "@/lib/utils";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY не задан");
  }
  return key;
}

export async function searchVideos(
  keyword: string,
  options?: { channelId?: string; regionCode?: string }
): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      key: getApiKey(),
      q: keyword,
      type: "video",
      order: "viewCount",
      videoDuration: "medium",
      maxResults: "25",
      publishedAfter: getDateTwoYearsAgo(),
      part: "id",
    });

    if (options?.channelId) {
      params.set("channelId", options.channelId);
      params.delete("q");
    }

    if (options?.regionCode) {
      params.set("regionCode", options.regionCode);
    }

    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    return (data.items || []).map(
      (item: { id: { videoId: string } }) => item.id.videoId
    );
  } catch (error) {
    throw new Error(
      `Ошибка поиска видео: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function getVideoDetails(
  videoIds: string[]
): Promise<VideoResult[]> {
  if (videoIds.length === 0) return [];

  try {
    const params = new URLSearchParams({
      key: getApiKey(),
      id: videoIds.join(","),
      part: "snippet,contentDetails,statistics",
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params}`);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    const results: VideoResult[] = [];

    for (const item of data.items || []) {
      const durationSeconds = parseDuration(item.contentDetails.duration);

      if (isShort(durationSeconds)) {
        continue;
      }

      results.push({
        id: item.id,
        title: item.snippet.title,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(item.statistics.viewCount || "0", 10),
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ||
          item.snippet.thumbnails.default?.url,
        videoUrl: buildVideoUrl(item.id),
        channelUrl: buildChannelUrl(item.snippet.channelId),
        durationSeconds,
      });
    }

    return results;
  } catch (error) {
    throw new Error(
      `Ошибка получения деталей видео: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export function deduplicateByChannel(videos: VideoResult[]): VideoResult[] {
  const channelMap = new Map<string, VideoResult>();

  for (const video of videos) {
    const existing = channelMap.get(video.channelId);
    if (!existing || video.viewCount > existing.viewCount) {
      channelMap.set(video.channelId, video);
    }
  }

  return Array.from(channelMap.values()).sort(
    (a, b) => b.viewCount - a.viewCount
  );
}

export async function getTopVideosForChannel(
  channelId: string,
  regionCode?: string
): Promise<VideoResult[]> {
  try {
    const params = new URLSearchParams({
      key: getApiKey(),
      channelId: channelId,
      type: "video",
      order: "viewCount",
      videoDuration: "medium",
      maxResults: "10",
      publishedAfter: getDateTwoYearsAgo(),
      part: "id",
    });

    if (regionCode) {
      params.set("regionCode", regionCode);
    }

    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    const videoIds = (data.items || []).map(
      (item: { id: { videoId: string } }) => item.id.videoId
    );

    if (videoIds.length === 0) return [];

    const videos = await getVideoDetails(videoIds);

    return videos.slice(0, 3);
  } catch (error) {
    throw new Error(
      `Ошибка получения топ видео канала: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
