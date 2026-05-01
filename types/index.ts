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

export interface SavedResearch {
  id: string;
  date: string;
  keywords: string[];
  regionCode: string;
  table1: VideoResult[];
  table2: VideoResult[];
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

// Channel Profiles
export interface CreateChannelProfileInput {
  name: string;
  isPersonalBrand: boolean;
  description: string;
}

// Outlines
export interface CreateOutlineInput {
  title: string;
  content: string;
  sourceType: "manual" | "video" | "topic";
  sourceVideoId?: string;
}

// Scripts
export interface CreateScriptInput {
  outlineId: string;
  channelProfileId: string;
  title: string;
  content: string;
  callToAction: string;
}

// AI
export interface OutlineToScriptParams {
  outline: string;
  channelName: string;
  isPersonalBrand: boolean;
  channelDescription: string;
  callToAction: string;
}
