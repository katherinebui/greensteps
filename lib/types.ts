export type DietType = "omnivore" | "vegetarian" | "vegan" | "pescatarian";

export type TransportMode = "car" | "public_transit" | "bike_walk" | "mixed";

export interface QuizAnswers {
  diet: DietType;
  weeklyMilesDriven: number; // miles per week
  electricityKwhPerMonth: number; // kWh per month
  homeHeating: "gas" | "electric" | "heat_pump" | "other";
  flightsShortHaulPerYear: number; // count
  recyclingHabit: "rarely" | "sometimes" | "often" | "always";
  transportMode: TransportMode;
}

export interface GeoLocation {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface CarbonEstimateInput {
  weeklyMilesDriven: number;
  electricityKwhPerMonth: number;
  homeHeating: QuizAnswers["homeHeating"];
  flightsShortHaulPerYear: number;
}

export interface CarbonEstimateResult {
  kgCO2ePerYear: number;
  breakdown: Record<string, number>;
}

