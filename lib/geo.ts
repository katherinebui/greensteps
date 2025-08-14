import { GeoLocation } from "./types";

export async function lookupGeo(): Promise<GeoLocation> {
  const provider = process.env.NEXT_PUBLIC_GEO_PROVIDER || "geojs";
  try {
    if (provider === "ipinfo") {
      const res = await fetch("https://ipinfo.io/json", { cache: "no-store" });
      if (!res.ok) throw new Error("ipinfo failed");
      const data = await res.json();
      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
      };
    }
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("geojs failed");
    const data = await res.json();
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
    };
  } catch {
    return {};
  }
}

