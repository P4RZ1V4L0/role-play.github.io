import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateRoleplayResponse(
  systemPrompt: string,
  history: { role: string; text: string; image?: string }[],
  userMessage: string,
  userImage?: string,
  nsfwEnabled: boolean = false
) {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const contents = history.map(h => {
    const parts: any[] = [];
    if (h.image) {
      const mimeType = h.image.split(';')[0].split(':')[1];
      const data = h.image.split(',')[1];
      parts.push({ inlineData: { data, mimeType } });
    }
    if (h.text) {
      parts.push({ text: h.text });
    }
    return { role: h.role === 'user' ? 'user' : 'model', parts };
  });

  const currentUserParts: any[] = [];
  if (userImage) {
    const mimeType = userImage.split(';')[0].split(':')[1];
    const data = userImage.split(',')[1];
    currentUserParts.push({ inlineData: { data, mimeType } });
  }
  if (userMessage) {
    currentUserParts.push({ text: userMessage });
  }
  if (currentUserParts.length > 0) {
    contents.push({ role: 'user', parts: currentUserParts });
  }

  const safetySettings = nsfwEnabled ? [
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ] : undefined;

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.8,
      safetySettings,
    }
  });

  const response = await model;
  return response.text;
}

export async function generateImage(prompt: string) {
  if (!apiKey) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
    }
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No se pudo generar la imagen");
}

