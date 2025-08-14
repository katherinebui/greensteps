import OpenAI from "openai";
import { QuizAnswers } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAdvice(args: {
  quiz: QuizAnswers;
  locationSummary?: string;
  carbonKgPerYear?: number;
}): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Set OPENAI_API_KEY to enable AI-generated tips.";
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const { quiz, locationSummary, carbonKgPerYear } = args;
  const system = `You are GreenSteps, a sustainability coach. Provide concise, practical, location-aware advice with estimated impact. Use bullet points; 5-7 tips.`;
  const user = `Location: ${locationSummary ?? "Unknown"}
Estimated Annual Footprint: ${carbonKgPerYear ? `${carbonKgPerYear} kg CO2e` : "N/A"}
Diet: ${quiz.diet}
Transport mode: ${quiz.transportMode}; weekly miles: ${quiz.weeklyMilesDriven}
Electricity: ${quiz.electricityKwhPerMonth} kWh/month; Heating: ${quiz.homeHeating}
Flights (short-haul/yr): ${quiz.flightsShortHaulPerYear}
Recycling: ${quiz.recyclingHabit}

Return actionable tips, ordered by potential impact in this context.`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content ?? "";
}

