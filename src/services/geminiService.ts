import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getGameReview(gameType: string, score: { p1: number, p2: number }, winner: string) {
  try {
    const prompt = `You are a professional billiards and snooker commentator. 
    Analyze this match result:
    Game: ${gameType}
    Score: Player 1 (${score.p1}) vs Player 2 (${score.p2})
    Winner: ${winner}
    
    Provide a concise, witty, and insightful 2-3 sentence commentary on this performance. 
    Use terminology specific to ${gameType}. Be encouraging but analytical.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return result.text || "The match was hard-fought and showed great tactical awareness from both sides.";
  } catch (error) {
    console.error("Gemini Review Error:", error);
    return "The match was hard-fought and showed great tactical awareness from both sides.";
  }
}
