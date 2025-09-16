import OpenAI from "openai";
import { QuizAnswers } from "./types";

function generateLocalAdvice(args: {
  quiz: QuizAnswers;
  locationSummary?: string;
  carbonKgPerYear?: number;
}): string {
  const { quiz, locationSummary, carbonKgPerYear } = args;
  const tips: Array<{ text: string; impact: number }> = [];

  // Transport
  if (quiz.transportMode !== "bike_walk" || quiz.weeklyMilesDriven > 0) {
    const reduceMiles = Math.min(quiz.weeklyMilesDriven, 50);
    const savedKg = Math.round(reduceMiles * 52 * 0.404);
    tips.push({
      text: `Swap ${reduceMiles} weekly car miles for transit/bike. ~${savedKg.toLocaleString()} kg CO₂e/yr`,
      impact: savedKg,
    });
  }

  // Diet
  if (quiz.diet !== "vegan") {
    const savedKg = quiz.diet === "omnivore" ? 1000 : 500;
    tips.push({
      text: `Make 3–4 meals/week plant‑based. ~${savedKg.toLocaleString()} kg CO₂e/yr`,
      impact: savedKg,
    });
  }

  // Electricity
  if (quiz.electricityKwhPerMonth > 0) {
    const annual = quiz.electricityKwhPerMonth * 12;
    const savedKg = Math.round(annual * 0.15 * 0.4); // 15% efficiency @ 0.4 kg/kWh
    tips.push({
      text: `Cut electricity by ~15% with LED + smart power strips. ~${savedKg.toLocaleString()} kg CO₂e/yr`,
      impact: savedKg,
    });
  }

  // Heating
  if (quiz.homeHeating === "gas") {
    tips.push({
      text: `Seal drafts + tune thermostat (−2°F). Prep for heat‑pump when replacing furnace. ~1,000 kg CO₂e/yr`,
      impact: 1000,
    });
  } else if (quiz.homeHeating === "electric") {
    tips.push({
      text: `Enroll in green power or community solar; set thermostat smart schedule. ~700 kg CO₂e/yr`,
      impact: 700,
    });
  }

  // Flights
  if (quiz.flightsShortHaulPerYear > 0) {
    const savedKg = quiz.flightsShortHaulPerYear * 250;
    tips.push({
      text: `Replace one short‑haul flight with rail/virtual. ~${savedKg.toLocaleString()} kg CO₂e`,
      impact: savedKg,
    });
  }

  // Recycling / waste
  if (quiz.recyclingHabit === "rarely" || quiz.recyclingHabit === "sometimes") {
    tips.push({
      text: `Sort recycling + compost organics; cut landfill waste fees and emissions.`,
      impact: 100,
    });
  }

  // Sort by estimated impact and cap to 3 tips
  tips.sort((a, b) => b.impact - a.impact);
  const selected = tips.slice(0, 3);

  const header = `Location: ${locationSummary ?? "Unknown"}\nEstimated Annual Footprint: ${carbonKgPerYear ? `${carbonKgPerYear} kg CO₂e` : "N/A"}`;
  const bullets = selected.map(t => `• ${t.text}`).join("\n");
  return `${header}\n\n${bullets}`;
}

export async function generateAdvice(args: {
  quiz: QuizAnswers;
  locationSummary?: string;
  carbonKgPerYear?: number;
}): Promise<string> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const { quiz, locationSummary, carbonKgPerYear } = args;
  const system = `You are GreenSteps, a sustainability coach. Provide concise, practical, location-aware advice with estimated impact. Use bullet points; 3 tips maximum.`;
  const user = `Location: ${locationSummary ?? "Unknown"}
Estimated Annual Footprint: ${carbonKgPerYear ? `${carbonKgPerYear} kg CO2e` : "N/A"}
Diet: ${quiz.diet}
Transport mode: ${quiz.transportMode}; weekly miles: ${quiz.weeklyMilesDriven}
Electricity: ${quiz.electricityKwhPerMonth} kWh/month; Heating: ${quiz.homeHeating}
Flights (short-haul/yr): ${quiz.flightsShortHaulPerYear}
Recycling: ${quiz.recyclingHabit}

Return actionable tips, ordered by potential impact in this context.`;

  // Free mode: generate tips locally and avoid any external API usage
  const useFree = process.env.USE_FREE_AI === "1" || !process.env.OPENAI_API_KEY;
  if (useFree) {
    return generateLocalAdvice({ quiz, locationSummary, carbonKgPerYear });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    });
    const content = completion.choices[0]?.message?.content ?? "";
    return content || generateLocalAdvice({ quiz, locationSummary, carbonKgPerYear });
  } catch (error) {
    console.error("OpenAI chat completion failed:", error);
    return generateLocalAdvice({ quiz, locationSummary, carbonKgPerYear });
  }
}

