import { describe, it, expect } from 'vitest'
import { quizSchema } from '../../lib/schemas'

describe('quizSchema validation', () => {
  it('should validate correct quiz data', () => {
    const validData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 2,
      recyclingHabit: 'often' as const,
      transportMode: 'mixed' as const,
    }

    const result = quizSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it('should validate all diet types', () => {
    const diets = ['omnivore', 'vegetarian', 'vegan', 'pescatarian'] as const
    
    diets.forEach(diet => {
      const data = {
        diet,
        weeklyMilesDriven: 50,
        electricityKwhPerMonth: 400,
        homeHeating: 'electric' as const,
        flightsShortHaulPerYear: 0,
        recyclingHabit: 'often' as const,
        transportMode: 'car' as const,
      }
      
      const result = quizSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('should validate all transport modes', () => {
    const transportModes = ['car', 'public_transit', 'bike_walk', 'mixed'] as const
    
    transportModes.forEach(mode => {
      const data = {
        diet: 'omnivore' as const,
        weeklyMilesDriven: 50,
        electricityKwhPerMonth: 400,
        homeHeating: 'electric' as const,
        flightsShortHaulPerYear: 0,
        recyclingHabit: 'often' as const,
        transportMode: mode,
      }
      
      const result = quizSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('should validate all heating types', () => {
    const heatingTypes = ['gas', 'electric', 'heat_pump', 'other'] as const
    
    heatingTypes.forEach(heating => {
      const data = {
        diet: 'omnivore' as const,
        weeklyMilesDriven: 50,
        electricityKwhPerMonth: 400,
        homeHeating: heating,
        flightsShortHaulPerYear: 0,
        recyclingHabit: 'often' as const,
        transportMode: 'car' as const,
      }
      
      const result = quizSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('should validate all recycling habits', () => {
    const recyclingHabits = ['rarely', 'sometimes', 'often', 'always'] as const
    
    recyclingHabits.forEach(habit => {
      const data = {
        diet: 'omnivore' as const,
        weeklyMilesDriven: 50,
        electricityKwhPerMonth: 400,
        homeHeating: 'electric' as const,
        flightsShortHaulPerYear: 0,
        recyclingHabit: habit,
        transportMode: 'car' as const,
      }
      
      const result = quizSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid diet', () => {
    const invalidData = {
      diet: 'invalid-diet',
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative weekly miles', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: -10,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject excessive weekly miles', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 6000,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative electricity usage', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: -100,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject excessive electricity usage', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 25000,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject negative flights', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: -5,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject excessive flights', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 150,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject non-integer flights', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 50,
      electricityKwhPerMonth: 400,
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 2.5,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject missing required fields', () => {
    const invalidData = {
      diet: 'omnivore' as const,
      weeklyMilesDriven: 50,
      // missing electricityKwhPerMonth
      homeHeating: 'electric' as const,
      flightsShortHaulPerYear: 0,
      recyclingHabit: 'often' as const,
      transportMode: 'car' as const,
    }

    const result = quizSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
