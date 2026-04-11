import {
  searchVideos,
  getVideoDetails,
  deduplicateByChannel,
  getTopVideosForChannel,
} from "@/lib/youtube";
import {
  ApiResearchRequest,
  ApiResearchResponse,
  VideoResult,
} from "@/types/index";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ApiResearchRequest;

    const { keywords } = body;

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: "keywords должен быть непустым массивом" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (keywords.length > 5) {
      return new Response(
        JSON.stringify({ error: "Максимум 5 ключевых слов" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    for (const kw of keywords) {
      if (typeof kw !== "string" || kw.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: "Каждый keyword должен быть непустой строкой" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (kw.length > 50) {
        return new Response(
          JSON.stringify({ error: "Каждый keyword не может быть длиннее 50 символов" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const table1Results = await Promise.all(
      keywords.map(async (keyword) => {
        try {
          const videoIds = await searchVideos(keyword);
          if (videoIds.length === 0) return [];

          const videos = await getVideoDetails(videoIds);
          const deduplicated = deduplicateByChannel(videos);
          const top7 = deduplicated.slice(0, 7);

          return top7.map((video) => ({ ...video, keyword }));
        } catch {
          return [];
        }
      })
    );

    const table1: VideoResult[] = table1Results.flat();

    const uniqueChannelIds = [...new Set(table1.map((v) => v.channelId))];
    const table1VideoIds = new Set(table1.map((v) => v.id));

    const table2Results = await Promise.all(
      uniqueChannelIds.map(async (channelId) => {
        try {
          const topVideos = await getTopVideosForChannel(channelId);
          return topVideos.filter((video) => !table1VideoIds.has(video.id));
        } catch {
          return [];
        }
      })
    );

    const table2: VideoResult[] = table2Results.flat();

    const responseData: ApiResearchResponse = { table1, table2 };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Внутренняя ошибка сервера" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
