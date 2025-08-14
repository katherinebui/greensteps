import { CarbonEstimateInput, CarbonEstimateResult } from "./types";

const CARBON_API = "https://www.carboninterface.com/api/v1";

async function postCarbon<T>(path: string, body: unknown): Promise<T> {
  const apiKey = process.env.CARBON_INTERFACE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing CARBON_INTERFACE_API_KEY");
  }
  const res = await fetch(`${CARBON_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Carbon API error: ${res.status} ${text}`);
  }
  return res.json();
}

type CarbonApiEstimate = { data?: { attributes?: { carbon_kg?: number } } };

export async function estimateCarbon(input: CarbonEstimateInput): Promise<CarbonEstimateResult> {
  const breakdown: Record<string, number> = {};
  let total = 0;

  // Vehicle miles: use passenger car default. Carbon Interface expects distance in mi
  if (input.weeklyMilesDriven > 0) {
    const annualMiles = input.weeklyMilesDriven * 52;
    try {
      const vehicle = await postCarbon<CarbonApiEstimate>("/estimates", {
        type: "vehicle",
        distance_unit: "mi",
        distance_value: annualMiles,
        vehicle_model_id: "passenger_car",
      });
      const kg = vehicle.data?.attributes?.carbon_kg ?? annualMiles * 0.404;
      breakdown["driving"] = kg;
      total += kg;
    } catch {
      // fallback rough factor ~404 g/mi
      const kg = (annualMiles * 0.404);
      breakdown["driving"] = kg;
      total += kg;
    }
  }

  // Electricity usage: Carbon Interface electricity estimates require location + energy_mix.
  if (input.electricityKwhPerMonth > 0) {
    const annualKwh = input.electricityKwhPerMonth * 12;
    try {
      const electricity = await postCarbon<CarbonApiEstimate>("/estimates", {
        type: "electricity",
        electricity_unit: "kwh",
        electricity_value: annualKwh,
        country: "US", // could be enhanced via geo lookup
        state: null,
      });
      const kg = electricity.data?.attributes?.carbon_kg ?? annualKwh * 0.4;
      breakdown["electricity"] = kg;
      total += kg;
    } catch {
      // fallback average ~0.4 kg/kWh
      const kg = annualKwh * 0.4;
      breakdown["electricity"] = kg;
      total += kg;
    }
  }

  // Heating heuristic factors
  if (input.homeHeating === "gas") {
    breakdown["heating"] = 1000;
    total += 1000;
  } else if (input.homeHeating === "electric") {
    breakdown["heating"] = 700;
    total += 700;
  } else if (input.homeHeating === "heat_pump") {
    breakdown["heating"] = 300;
    total += 300;
  }

  // Flights short-haul ~0.25 tCO2e per short-haul roundtrip
  if (input.flightsShortHaulPerYear > 0) {
    const kg = input.flightsShortHaulPerYear * 250;
    breakdown["flights"] = kg;
    total += kg;
  }

  return { kgCO2ePerYear: Math.max(0, Math.round(total)), breakdown };
}

