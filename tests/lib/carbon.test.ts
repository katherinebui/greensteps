import { describe, it, expect, vi, beforeEach } from 'vitest'
import { estimateCarbon } from '../../lib/carbon'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('estimateCarbon function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should calculate carbon footprint with all inputs', async () => {
    // Mock successful API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { attributes: { carbon_kg: 2100 } }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { attributes: { carbon_kg: 1920 } }
        })
      })

    const input = {
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'gas' as const,
      flightsShortHaulPerYear: 2,
    }

    const result = await estimateCarbon(input)

    expect(result.kgCO2ePerYear).toBeGreaterThan(0)
    expect(result.breakdown).toHaveProperty('driving')
    expect(result.breakdown).toHaveProperty('electricity')
    expect(result.breakdown).toHaveProperty('heating')
    expect(result.breakdown).toHaveProperty('flights')
    
    // Verify API calls were made
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should handle zero weekly miles', async () => {
    const input = {
      weeklyMilesDriven: 0,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: { attributes: { carbon_kg: 1920 } }
      })
    })

    const result = await estimateCarbon(input)

    expect(result.breakdown.driving).toBe(0)
    expect(mockFetch).toHaveBeenCalledTimes(1) // Only electricity call
  })

  it('should handle zero electricity usage', async () => {
    const input = {
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 0,
      homeHeating: 'heat_pump' as const,
      flightsShortHaulPerYear: 0,
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: { attributes: { carbon_kg: 2100 } }
      })
    })

    const result = await estimateCarbon(input)

    expect(result.breakdown.electricity).toBe(0)
    expect(mockFetch).toHaveBeenCalledTimes(1) // Only driving call
  })

  it('should use fallback calculations when API fails', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))

    const input = {
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'gas' as const,
      flightsShortHaulPerYear: 2,
    }

    const result = await estimateCarbon(input)

    // Should still return a result using fallback calculations
    expect(result.kgCO2ePerYear).toBeGreaterThan(0)
    expect(result.breakdown).toHaveProperty('driving')
    expect(result.breakdown).toHaveProperty('electricity')
    expect(result.breakdown).toHaveProperty('heating')
    expect(result.breakdown).toHaveProperty('flights')
  })

  it('should calculate correct heating values for different types', async () => {
    const heatingTests = [
      { type: 'gas' as const, expected: 1000 },
      { type: 'electric' as const, expected: 700 },
      { type: 'heat_pump' as const, expected: 300 },
      { type: 'other' as const, expected: 0 },
    ]

    for (const { type, expected } of heatingTests) {
      const input = {
        weeklyMilesDriven: 0,
        electricityKwhPerMonth: 0,
        homeHeating: type,
        flightsShortHaulPerYear: 0,
      }

      const result = await estimateCarbon(input)
      expect(result.breakdown.heating).toBe(expected)
    }
  })

  it('should calculate flight emissions correctly', async () => {
    const input = {
      weeklyMilesDriven: 0,
      electricityKwhPerMonth: 0,
      homeHeating: 'other' as const,
      flightsShortHaulPerYear: 5,
    }

    const result = await estimateCarbon(input)
    expect(result.breakdown.flights).toBe(1250) // 5 * 250 kg CO2e
  })

  it('should handle API responses without carbon_kg data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { attributes: {} } // No carbon_kg
      })
    })

    const input = {
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
    }

    const result = await estimateCarbon(input)

    // Should use fallback calculations
    expect(result.kgCO2ePerYear).toBeGreaterThan(0)
    expect(result.breakdown.driving).toBeGreaterThan(0)
    expect(result.breakdown.electricity).toBeGreaterThan(0)
  })

  it('should ensure total is never negative', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'))

    const input = {
      weeklyMilesDriven: 0,
      electricityKwhPerMonth: 0,
      homeHeating: 'other' as const,
      flightsShortHaulPerYear: 0,
    }

    const result = await estimateCarbon(input)
    expect(result.kgCO2ePerYear).toBe(0)
  })

  it('should round the total to nearest integer', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { attributes: { carbon_kg: 1234.567 } }
      })
    })

    const input = {
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 0,
      homeHeating: 'other' as const,
      flightsShortHaulPerYear: 0,
    }

    const result = await estimateCarbon(input)
    expect(Number.isInteger(result.kgCO2ePerYear)).toBe(true)
  })

  it('should make correct API calls for vehicle estimation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { attributes: { carbon_kg: 2100 } }
      })
    })

    const input = {
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 0,
      homeHeating: 'other' as const,
      flightsShortHaulPerYear: 0,
    }

    await estimateCarbon(input)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.carboninterface.com/api/v1/estimates',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-carbon-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'vehicle',
          distance_unit: 'mi',
          distance_value: 2600, // 50 * 52
          vehicle_model_id: 'passenger_car',
        }),
      })
    )
  })

  it('should make correct API calls for electricity estimation', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { attributes: { carbon_kg: 1920 } }
      })
    })

    const input = {
      weeklyMilesDriven: 0,
      electricityKwhPerMonth: 400,
      homeHeating: 'other' as const,
      flightsShortHaulPerYear: 0,
    }

    await estimateCarbon(input)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.carboninterface.com/api/v1/estimates',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-carbon-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'electricity',
          electricity_unit: 'kwh',
          electricity_value: 4800, // 400 * 12
          country: 'US',
          state: null,
        }),
      })
    )
  })
})
