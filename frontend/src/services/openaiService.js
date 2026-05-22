
import OpenAI from "openai";
import { roadKnowledgeBase } from "../data/roadKnowledgeBase";
import { searchRoadData } from "../utils/roadSearch";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const askRoadAssistant = async (userMessage) => {
  try {
    const relevantRoads = searchRoadData(
      userMessage,
      roadKnowledgeBase
    );

    const prompt = `
You are RoadWatch AI Assistant.

Answer ONLY using the provided road infrastructure dataset.

Dataset:
${JSON.stringify(relevantRoads, null, 2)}

User Question:
${userMessage}

Rules:
- Never hallucinate
- Be accurate
- Mention contractor, condition, cost and complaints if relevant
- If data not found say:
"No matching road data found"
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an intelligent Smart Infrastructure AI Assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "AI Assistant failed to respond.";
  }
};
