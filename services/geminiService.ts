import { GoogleGenAI } from "@google/genai";
import { Stock } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketAnalysis = async (stocks: Stock[]): Promise<string> => {
  try {
    // Filter for top movers to save token context
    const sorted = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    const topMovers = sorted.slice(0, 5).map(s => ({
      symbol: s.symbol,
      name: s.name,
      price: s.price.toFixed(2),
      change: s.changePercent.toFixed(2) + "%",
      sector: s.sector
    }));

    const prompt = `
      Act as a senior Bloomberg market analyst. 
      Analyze the following live market data snapshot for NASDAQ top movers.
      
      Data: ${JSON.stringify(topMovers)}
      
      Provide a concise, professional, and slightly dramatic 2-3 sentence market commentary. 
      Focus on the biggest mover and the sector implications. 
      Do not use markdown. Just plain text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Market analysis unavailable at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Analyst systems are currently offline. Please check connection.";
  }
};
