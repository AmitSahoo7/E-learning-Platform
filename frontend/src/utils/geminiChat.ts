// src/utils/geminiChat.ts
import { GoogleGenAI } from "@google/genai";

export type GeminiMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function* streamGeminiResponse(
  apiKey: string,
  conversation: GeminiMessage[]
): AsyncGenerator<string, void, unknown> {
  const ai = new GoogleGenAI({ apiKey });
  const config = { responseMimeType: "text/plain" };
  const model = "gemini-2.0-flash";

  // Convert conversation to Gemini format
  const contents = conversation.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let fullText = "";
  for await (const chunk of response) {
    fullText += chunk.text;
    yield fullText;
  }
}