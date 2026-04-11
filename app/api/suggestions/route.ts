import { generateSuggestions } from "@/lib/claude";
import { ApiSuggestionsRequest, ApiSuggestionsResponse } from "@/types/index";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ApiSuggestionsRequest;

    const { keyword, existingKeywords } = body;

    if (!keyword || typeof keyword !== "string") {
      return new Response(
        JSON.stringify({ error: "keyword должен быть непустой строкой" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (keyword.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "keyword не может быть пустым" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (keyword.length > 50) {
      return new Response(
        JSON.stringify({ error: "keyword не может быть длиннее 50 символов" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const wordCount = keyword.trim().split(/\s+/).length;
    if (wordCount > 5) {
      return new Response(
        JSON.stringify({ error: "keyword не может содержать больше 5 слов" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(existingKeywords)) {
      return new Response(
        JSON.stringify({ error: "existingKeywords должен быть массивом" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const suggestions = await generateSuggestions(keyword, existingKeywords);

    const responseData: ApiSuggestionsResponse = { suggestions };

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
