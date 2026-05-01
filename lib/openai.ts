import OpenAI from "openai";
import type { OutlineToScriptParams } from "@/types/index";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY не задан");
  return new OpenAI({ apiKey });
}

export async function transcriptToOutline(transcript: string): Promise<string> {
  const client = getClient();
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content:
            "Ты — помощник YouTube-автора. Проанализируй транскрипцию видео и создай структурированную фабулу: основная идея, ключевые тезисы, логическая структура для нового видео. Пиши кратко, по делу.",
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Пустой ответ от OpenAI");
    return content;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Ошибка генерации фабулы из транскрипции"
    );
  }
}

export async function topicToOutline(topic: string): Promise<string> {
  const client = getClient();
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `Ты — помощник YouTube-автора. Создай структурированную фабулу для видео на тему: ${topic}. Включи: цепляющее вступление, 3-5 ключевых тезисов, логические переходы, заключение. Пиши кратко.`,
        },
        {
          role: "user",
          content: topic,
        },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Пустой ответ от OpenAI");
    return content;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Ошибка генерации фабулы по теме"
    );
  }
}

export async function outlineToScript(
  params: OutlineToScriptParams
): Promise<string> {
  const { outline, channelName, isPersonalBrand, channelDescription, callToAction } =
    params;
  const client = getClient();

  const userPrompt = `Напиши сценарий YouTube-ролика.
${isPersonalBrand ? `Автор — ${channelName}, представляется по имени.` : `Канал — ${channelName}, упоминается как бренд.`}
О канале: ${channelDescription}

Фабула ролика:
${outline}

Требования:
1. Начни с цепляющего вступления (первые 30 секунд должны захватить внимание)
2. После первой трети текста добавь нативную подводку: ${callToAction}
   Подводка должна звучать органично, не как реклама
3. Пиши разговорным языком, используй короткие абзацы
4. В конце добавь призыв к действию (лайк, подписка)`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 2500,
      messages: [
        {
          role: "system",
          content:
            "Ты — профессиональный сценарист YouTube. Пиши живым разговорным языком. Не используй клише. Текст должен звучать естественно при чтении вслух.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Пустой ответ от OpenAI");
    return content;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Ошибка генерации сценария"
    );
  }
}
