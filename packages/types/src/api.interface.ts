export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface AiImproveResponse {
  improved: string;
}

export interface AiSuggestCategoriesResponse {
  suggestions: string[];
}
