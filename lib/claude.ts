import OpenAI from "openai";

export async function generateSuggestions(
  keyword: string,
  existingKeywords: string[]
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY не задан");
  }

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "Ты помогаешь YouTube-авторам находить смежные поисковые запросы. Отвечай ТОЛЬКО валидным JSON массивом из 3 строк. Никакого другого текста, никаких markdown блоков.",
        },
        {
          role: "user",
          content: `Ключевой запрос: ${keyword}
Уже выбранные запросы (не повторяй): ${existingKeywords.join(", ") || "нет"}
Предложи 3 смежных запроса на том же языке что и ключевой.
Каждый запрос максимум 5 слов. Только JSON массив.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }

    return [];
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return [];
  }
}
