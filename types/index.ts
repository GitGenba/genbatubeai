export interface VideoResult {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  viewCount: number;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelUrl: string;
  keyword?: string;
  durationSeconds: number;
}

export interface ResearchState {
  keywords: string[];
  suggestions: string[];
  table1: VideoResult[];
  table2: VideoResult[];
  finalList: VideoResult[];
  isLoading: boolean;
  isLoadingTable2: boolean;
  error: string | null;
  regionCode: string;
}

export interface RegionOption {
  code: string;
  name: string;
}

export interface ApiSuggestionsRequest {
  keyword: string;
  existingKeywords: string[];
}

export interface ApiSuggestionsResponse {
  suggestions: string[];
}

export interface ApiResearchRequest {
  keywords: string[];
  regionCode?: string;
}

export interface ApiResearchResponse {
  table1: VideoResult[];
  table2: VideoResult[];
}
