export function parseDuration(iso: string): number {
  if (!iso) return 0;

  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export function isShort(durationSeconds: number): boolean {
  return durationSeconds < 61;
}

export function formatViewCount(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

export function getDateTwoYearsAgo(): string {
  const now = new Date();
  now.setUTCFullYear(now.getUTCFullYear() - 2);
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString().replace(".000Z", "Z");
}

export function buildVideoUrl(videoId: string): string {
  return `https://youtube.com/watch?v=${videoId}`;
}

export function buildChannelUrl(channelId: string): string {
  return `https://youtube.com/channel/${channelId}`;
}
