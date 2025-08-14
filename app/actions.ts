/**
 * 🖥️ SERVER ACTIONS
 * 
 * This file contains server-side functions that run on the Next.js server.
 * Server Actions are a Next.js 13+ feature that allows you to run server code
 * directly from your React components without building a separate API.
 * 
 * Key Concepts:
 * - "use server": Marks this file as server-only code
 * - FormData: Browser's built-in form data handling
 * - TypeScript: Type safety for function parameters and return values
 * - Error Handling: Graceful handling of API failures
 */

"use server"; // 🚨 SERVER DIRECTIVE: This tells Next.js this code runs only on the server
// This is important for security - sensitive operations like API calls happen server-side

import { quizSchema } from "@/lib/schemas"; // 📋 VALIDATION: Zod schema for form validation
import { estimateCarbon } from "@/lib/carbon"; // 🌍 CARBON API: External service for footprint calculation
import { generateAdvice } from "@/lib/ai"; // 🤖 AI API: OpenAI integration for personalized tips
import { lookupGeo } from "@/lib/geo"; // 📍 LOCATION: Geolocation service

/**
 * 📊 TYPE DEFINITION: ProcessQuizResult
 * 
 * This is a TypeScript union type that defines all possible return values.
 * Union types use the | operator to combine multiple types.
 */
export type ProcessQuizResult =
  // ❌ ERROR CASE: When something goes wrong
  | { ok: false; error: string; issues?: unknown }
  // ✅ SUCCESS CASE: When everything works
  | {
      ok: true;
      data: {
        quiz: ReturnType<typeof quizSchema.parse>; // 📋 PARSED QUIZ DATA: Validated form data
        location: Awaited<ReturnType<typeof lookupGeo>>; // 📍 LOCATION DATA: User's location
        estimate: null | { kg: number; breakdown: Record<string, number> }; // 🌍 CARBON ESTIMATE: Footprint calculation
        tips: string; // 💡 AI TIPS: Personalized advice
      };
    };

/**
 * 🎯 MAIN SERVER ACTION: processQuizAction
 * 
 * This function is called when the user submits the quiz form.
 * It processes form data, validates it, calls external APIs, and returns results.
 * 
 * Parameters:
 * - _prevState: Previous state (unused in this case, hence the underscore)
 * - formData: Browser's FormData object containing all form fields
 */
export async function processQuizAction(
  _prevState: ProcessQuizResult | null, 
  formData: FormData
): Promise<ProcessQuizResult> {
  
  // 📝 FORM DATA EXTRACTION: Convert FormData to a regular object
  // FormData.get() returns FormDataEntryValue | null, so we need to convert to proper types
  const raw = {
    diet: String(formData.get("diet")), // 🍽️ Convert to string
    weeklyMilesDriven: Number(formData.get("weeklyMilesDriven")), // 🚗 Convert to number
    electricityKwhPerMonth: Number(formData.get("electricityKwhPerMonth")), // ⚡ Convert to number
    homeHeating: String(formData.get("homeHeating")), // 🔥 Convert to string
    flightsShortHaulPerYear: Number(formData.get("flightsShortHaulPerYear")), // ✈️ Convert to number
    recyclingHabit: String(formData.get("recyclingHabit")), // ♻️ Convert to string
    transportMode: String(formData.get("transportMode")), // 🚌 Convert to string
  };
  
  // ✅ VALIDATION: Use Zod schema to validate the form data
  const parsed = quizSchema.safeParse(raw);
  if (!parsed.success) {
    // ❌ RETURN ERROR: If validation fails, return error state
    return { 
      ok: false, 
      error: "Invalid input", 
      issues: parsed.error.flatten() 
    };
  }

  // 📍 GET LOCATION: Fetch user's location for personalized advice
  const geo = await lookupGeo();
  const locationSummary = [geo.city, geo.region, geo.country]
    .filter(Boolean) // 🧹 Remove empty values
    .join(", "); // 🔗 Join with commas
  
  // 🌍 CALCULATE CARBON FOOTPRINT: Call external API with error handling
  let estimate = null as null | { kg: number; breakdown: Record<string, number> };
  try {
    const result = await estimateCarbon({
      weeklyMilesDriven: parsed.data.weeklyMilesDriven,
      electricityKwhPerMonth: parsed.data.electricityKwhPerMonth,
      homeHeating: parsed.data.homeHeating,
      flightsShortHaulPerYear: parsed.data.flightsShortHaulPerYear,
    });
    estimate = { kg: result.kgCO2ePerYear, breakdown: result.breakdown };
  } catch {
    // 🛡️ ERROR HANDLING: If carbon API fails, continue without estimate
    estimate = null;
  }

  // 🤖 GENERATE AI TIPS: Call OpenAI API with error handling
  let tips = "";
  try {
    tips = await generateAdvice({ 
      quiz: parsed.data, 
      locationSummary, 
      carbonKgPerYear: estimate?.kg 
    });
  } catch {
    // 🛡️ ERROR HANDLING: If AI API fails, show fallback message
    tips = "Unable to generate AI tips at this time.";
  }

  // ✅ RETURN SUCCESS: Return all processed data
  return { 
    ok: true, 
    data: { 
      quiz: parsed.data, 
      location: geo, 
      estimate, 
      tips 
    } 
  };
}

