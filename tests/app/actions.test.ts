import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processQuizAction } from '../../app/actions'

// Mock the dependencies
vi.mock('../../lib/schemas', () => ({
  quizSchema: {
    safeParse: vi.fn(),
  },
}))

vi.mock('../../lib/carbon', () => ({
  estimateCarbon: vi.fn(),
}))

vi.mock('../../lib/ai', () => ({
  generateAdvice: vi.fn(),
}))

vi.mock('../../lib/geo', () => ({
  lookupGeo: vi.fn(),
}))

describe('processQuizAction', () => {
  const mockQuizSchema = require('../../lib/schemas').quizSchema
  const mockEstimateCarbon = require('../../lib/carbon').estimateCarbon
  const mockGenerateAdvice = require('../../lib/ai').generateAdvice
  const mockLookupGeo = require('../../lib/geo').lookupGeo

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process valid quiz data successfully', async () => {
    const validQuizData = {
      diet: 'omnivore',
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric',
      flightsShortHaulPerYear: 2,
      recyclingHabit: 'often',
      transportMode: 'mixed',
    }

    const mockLocation = {
      city: 'San Francisco',
      region: 'CA',
      country: 'US',
    }

    const mockEstimate = {
      kgCO2ePerYear: 5000,
      breakdown: {
        driving: 2100,
        electricity: 1920,
        heating: 700,
        flights: 500,
      },
    }

    const mockTips = 'Here are some sustainability tips...'

    // Setup mocks
    mockQuizSchema.safeParse.mockReturnValue({
      success: true,
      data: validQuizData,
    })
    mockLookupGeo.mockResolvedValue(mockLocation)
    mockEstimateCarbon.mockResolvedValue(mockEstimate)
    mockGenerateAdvice.mockResolvedValue(mockTips)

    // Create FormData
    const formData = new FormData()
    formData.append('diet', 'omnivore')
    formData.append('weeklyMilesDriven', '50')
    formData.append('electricityKwhPerMonth', '400')
    formData.append('homeHeating', 'electric')
    formData.append('flightsShortHaulPerYear', '2')
    formData.append('recyclingHabit', 'often')
    formData.append('transportMode', 'mixed')

    const result = await processQuizAction(null, formData)

    expect(result).toEqual({
      ok: true,
      data: {
        quiz: validQuizData,
        location: mockLocation,
        estimate: {
          kg: 5000,
          breakdown: {
            driving: 2100,
            electricity: 1920,
            heating: 700,
            flights: 500,
          },
        },
        tips: mockTips,
      },
    })

    expect(mockQuizSchema.safeParse).toHaveBeenCalledWith({
      diet: 'omnivore',
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric',
      flightsShortHaulPerYear: 2,
      recyclingHabit: 'often',
      transportMode: 'mixed',
    })
  })

  it('should handle invalid quiz data', async () => {
    const mockError = {
      flatten: () => ({ fieldErrors: { diet: ['Invalid diet'] } }),
    }

    mockQuizSchema.safeParse.mockReturnValue({
      success: false,
      error: mockError,
    })

    const formData = new FormData()
    formData.append('diet', 'invalid-diet')
    formData.append('weeklyMilesDriven', '50')
    formData.append('electricityKwhPerMonth', '400')
    formData.append('homeHeating', 'electric')
    formData.append('flightsShortHaulPerYear', '2')
    formData.append('recyclingHabit', 'often')
    formData.append('transportMode', 'mixed')

    const result = await processQuizAction(null, formData)

    expect(result).toEqual({
      ok: false,
      error: 'Invalid input',
      issues: mockError,
    })
  })

  it('should handle carbon estimation failure', async () => {
    const validQuizData = {
      diet: 'omnivore',
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric',
      flightsShortHaulPerYear: 2,
      recyclingHabit: 'often',
      transportMode: 'mixed',
    }

    const mockLocation = {
      city: 'San Francisco',
      region: 'CA',
      country: 'US',
    }

    const mockTips = 'Here are some sustainability tips...'

    mockQuizSchema.safeParse.mockReturnValue({
      success: true,
      data: validQuizData,
    })
    mockLookupGeo.mockResolvedValue(mockLocation)
    mockEstimateCarbon.mockRejectedValue(new Error('Carbon API error'))
    mockGenerateAdvice.mockResolvedValue(mockTips)

    const formData = new FormData()
    formData.append('diet', 'omnivore')
    formData.append('weeklyMilesDriven', '50')
    formData.append('electricityKwhPerMonth', '400')
    formData.append('homeHeating', 'electric')
    formData.append('flightsShortHaulPerYear', '2')
    formData.append('recyclingHabit', 'often')
    formData.append('transportMode', 'mixed')

    const result = await processQuizAction(null, formData)

    expect(result).toEqual({
      ok: true,
      data: {
        quiz: validQuizData,
        location: mockLocation,
        estimate: null,
        tips: mockTips,
      },
    })
  })

  it('should handle AI advice generation failure', async () => {
    const validQuizData = {
      diet: 'omnivore',
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric',
      flightsShortHaulPerYear: 2,
      recyclingHabit: 'often',
      transportMode: 'mixed',
    }

    const mockLocation = {
      city: 'San Francisco',
      region: 'CA',
      country: 'US',
    }

    const mockEstimate = {
      kgCO2ePerYear: 5000,
      breakdown: {
        driving: 2100,
        electricity: 1920,
        heating: 700,
        flights: 500,
      },
    }

    mockQuizSchema.safeParse.mockReturnValue({
      success: true,
      data: validQuizData,
    })
    mockLookupGeo.mockResolvedValue(mockLocation)
    mockEstimateCarbon.mockResolvedValue(mockEstimate)
    mockGenerateAdvice.mockRejectedValue(new Error('AI API error'))

    const formData = new FormData()
    formData.append('diet', 'omnivore')
    formData.append('weeklyMilesDriven', '50')
    formData.append('electricityKwhPerMonth', '400')
    formData.append('homeHeating', 'electric')
    formData.append('flightsShortHaulPerYear', '2')
    formData.append('recyclingHabit', 'often')
    formData.append('transportMode', 'mixed')

    const result = await processQuizAction(null, formData)

    expect(result).toEqual({
      ok: true,
      data: {
        quiz: validQuizData,
        location: mockLocation,
        estimate: {
          kg: 5000,
          breakdown: {
            driving: 2100,
            electricity: 1920,
            heating: 700,
            flights: 500,
          },
        },
        tips: 'Unable to generate AI tips at this time.',
      },
    })
  })

  it('should handle empty location data', async () => {
    const validQuizData = {
      diet: 'omnivore',
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric',
      flightsShortHaulPerYear: 2,
      recyclingHabit: 'often',
      transportMode: 'mixed',
    }

    const mockEstimate = {
      kgCO2ePerYear: 5000,
      breakdown: {
        driving: 2100,
        electricity: 1920,
        heating: 700,
        flights: 500,
      },
    }

    const mockTips = 'Here are some sustainability tips...'

    mockQuizSchema.safeParse.mockReturnValue({
      success: true,
      data: validQuizData,
    })
    mockLookupGeo.mockResolvedValue({})
    mockEstimateCarbon.mockResolvedValue(mockEstimate)
    mockGenerateAdvice.mockResolvedValue(mockTips)

    const formData = new FormData()
    formData.append('diet', 'omnivore')
    formData.append('weeklyMilesDriven', '50')
    formData.append('electricityKwhPerMonth', '400')
    formData.append('homeHeating', 'electric')
    formData.append('flightsShortHaulPerYear', '2')
    formData.append('recyclingHabit', 'often')
    formData.append('transportMode', 'mixed')

    const result = await processQuizAction(null, formData)

    expect(result).toEqual({
      ok: true,
      data: {
        quiz: validQuizData,
        location: {},
        estimate: {
          kg: 5000,
          breakdown: {
            driving: 2100,
            electricity: 1920,
            heating: 700,
            flights: 500,
          },
        },
        tips: mockTips,
      },
    })
  })

  it('should handle string values in form data', async () => {
    const validQuizData = {
      diet: 'vegetarian',
      weeklyMilesDriven: 25,
      electricityKwhPerMonth: 300,
      homeHeating: 'heat_pump',
      flightsShortHaulPerYear: 1,
      recyclingHabit: 'always',
      transportMode: 'bike_walk',
    }

    const mockLocation = {
      city: 'Portland',
      region: 'OR',
      country: 'US',
    }

    const mockEstimate = {
      kgCO2ePerYear: 3000,
      breakdown: {
        driving: 0,
        electricity: 1440,
        heating: 300,
        flights: 250,
      },
    }

    const mockTips = 'Eco-friendly tips...'

    mockQuizSchema.safeParse.mockReturnValue({
      success: true,
      data: validQuizData,
    })
    mockLookupGeo.mockResolvedValue(mockLocation)
    mockEstimateCarbon.mockResolvedValue(mockEstimate)
    mockGenerateAdvice.mockResolvedValue(mockTips)

    const formData = new FormData()
    formData.append('diet', 'vegetarian')
    formData.append('weeklyMilesDriven', '25')
    formData.append('electricityKwhPerMonth', '300')
    formData.append('homeHeating', 'heat_pump')
    formData.append('flightsShortHaulPerYear', '1')
    formData.append('recyclingHabit', 'always')
    formData.append('transportMode', 'bike_walk')

    const result = await processQuizAction(null, formData)

    expect(result).toEqual({
      ok: true,
      data: {
        quiz: validQuizData,
        location: mockLocation,
        estimate: {
          kg: 3000,
          breakdown: {
            driving: 0,
            electricity: 1440,
            heating: 300,
            flights: 250,
          },
        },
        tips: mockTips,
      },
    })
  })

  it('should handle missing form data fields', async () => {
    const formData = new FormData()
    formData.append('diet', 'omnivore')
    // Missing other fields

    const mockError = {
      flatten: () => ({ fieldErrors: { weeklyMilesDriven: ['Required'] } }),
    }

    mockQuizSchema.safeParse.mockReturnValue({
      success: false,
      error: mockError,
    })

    const result = await processQuizAction(null, formData)

    expect(result).toEqual({
      ok: false,
      error: 'Invalid input',
      issues: mockError,
    })
  })
})
