/**
 * 📋 SCHEMA VALIDATION
 * 
 * This file defines the structure and validation rules for our form data.
 * We use Zod, a TypeScript-first schema validation library that helps us:
 * - Validate data at runtime
 * - Generate TypeScript types automatically
 * - Ensure data safety and consistency
 * 
 * Key Concepts:
 * - Schema Validation: Rules that data must follow
 * - TypeScript Types: Automatic type generation from schemas
 * - Runtime Safety: Catching errors when data doesn't match expected format
 */

import { z } from "zod"; // 📋 ZOD: TypeScript-first schema validation library

/**
 * 🎯 QUIZ SCHEMA: quizSchema
 * 
 * This schema defines the structure and validation rules for the quiz form data.
 * Each field has specific validation rules that ensure data quality.
 * 
 * Schema Structure:
 * - diet: Must be one of the specified diet types
 * - weeklyMilesDriven: Number between 0 and 5000
 * - electricityKwhPerMonth: Number between 0 and 20000
 * - homeHeating: Must be one of the specified heating types
 * - flightsShortHaulPerYear: Integer between 0 and 100
 * - recyclingHabit: Must be one of the specified recycling frequencies
 * - transportMode: Must be one of the specified transport modes
 */
export const quizSchema = z.object({
  // 🍽️ DIET FIELD: Enum validation - only allows specific values
  diet: z.enum(["omnivore", "vegetarian", "vegan", "pescatarian"]),
  
  // 🚗 WEEKLY MILES: Number with min/max constraints
  weeklyMilesDriven: z.number().min(0).max(5000),
  
  // ⚡ ELECTRICITY USAGE: Number with min/max constraints
  electricityKwhPerMonth: z.number().min(0).max(20000),
  
  // 🔥 HOME HEATING: Enum validation for heating types
  homeHeating: z.enum(["gas", "electric", "heat_pump", "other"]),
  
  // ✈️ FLIGHTS: Integer with min/max constraints
  flightsShortHaulPerYear: z.number().int().min(0).max(100),
  
  // ♻️ RECYCLING HABIT: Enum validation for recycling frequency
  recyclingHabit: z.enum(["rarely", "sometimes", "often", "always"]),
  
  // 🚌 TRANSPORT MODE: Enum validation for transport types
  transportMode: z.enum(["car", "public_transit", "bike_walk", "mixed"]),
});

/**
 * 📊 TYPE INFERENCE: QuizForm
 * 
 * TypeScript automatically generates a type from our Zod schema.
 * This ensures that our TypeScript types always match our validation rules.
 * 
 * The z.infer<typeof quizSchema> creates a TypeScript type that looks like:
 * {
 *   diet: "omnivore" | "vegetarian" | "vegan" | "pescatarian";
 *   weeklyMilesDriven: number;
 *   electricityKwhPerMonth: number;
 *   homeHeating: "gas" | "electric" | "heat_pump" | "other";
 *   flightsShortHaulPerYear: number;
 *   recyclingHabit: "rarely" | "sometimes" | "often" | "always";
 *   transportMode: "car" | "public_transit" | "bike_walk" | "mixed";
 * }
 */
export type QuizForm = z.infer<typeof quizSchema>;

