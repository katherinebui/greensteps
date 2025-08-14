import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuizPage from '../../app/quiz/page'

// Mock all dependencies
vi.mock('../../app/actions', () => ({
  processQuizAction: vi.fn(),
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

// Mock useActionState
const mockUseActionState = vi.fn()
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useActionState: mockUseActionState,
  }
})

describe('Quiz Flow Integration', () => {
  const mockFormAction = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseActionState.mockReturnValue([null, mockFormAction, false])
  })

  it('should handle complete quiz submission flow', async () => {
    render(<QuizPage />)

    // Fill out the form
    await user.selectOptions(screen.getByLabelText(/diet/i), 'vegetarian')
    await user.selectOptions(screen.getByLabelText(/transport/i), 'bike_walk')
    await user.clear(screen.getByLabelText(/weekly miles driven/i))
    await user.type(screen.getByLabelText(/weekly miles driven/i), '10')
    await user.clear(screen.getByLabelText(/electricity/i))
    await user.type(screen.getByLabelText(/electricity/i), '300')
    await user.selectOptions(screen.getByLabelText(/heating/i), 'heat_pump')
    await user.clear(screen.getByLabelText(/short-haul flights per year/i))
    await user.type(screen.getByLabelText(/short-haul flights per year/i), '1')
    await user.selectOptions(screen.getByLabelText(/recycling habit/i), 'always')

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /get results/i })
    await user.click(submitButton)

    // Verify form action was called
    expect(mockFormAction).toHaveBeenCalled()
  })

  it('should show loading state during submission', async () => {
    // Start with loading state
    mockUseActionState.mockReturnValue([null, mockFormAction, true])
    
    render(<QuizPage />)
    
    expect(screen.getByRole('button', { name: /calculating/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
  })

  it('should display results after successful submission', async () => {
    const successState = {
      ok: true,
      data: {
        quiz: {
          diet: 'vegetarian',
          weeklyMilesDriven: 10,
          electricityKwhPerMonth: 300,
          homeHeating: 'heat_pump',
          flightsShortHaulPerYear: 1,
          recyclingHabit: 'always',
          transportMode: 'bike_walk',
        },
        location: {
          city: 'Portland',
          region: 'OR',
          country: 'US',
        },
        estimate: {
          kg: 2500,
          breakdown: {
            driving: 0,
            electricity: 1440,
            heating: 300,
            flights: 250,
          },
        },
        tips: '• Consider switching to renewable energy\n• Reduce meat consumption further\n• Use public transport when possible',
      },
    }
    
    mockUseActionState.mockReturnValue([successState, mockFormAction, false])
    
    render(<QuizPage />)
    
    // Check that results are displayed
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('2,500 kg CO2e')).toBeInTheDocument()
    expect(screen.getByText('AI Tips')).toBeInTheDocument()
    expect(screen.getByText(/Consider switching to renewable energy/)).toBeInTheDocument()
    
    // Check breakdown
    expect(screen.getByText('Driving')).toBeInTheDocument()
    expect(screen.getByText('0 kg')).toBeInTheDocument()
    expect(screen.getByText('Electricity')).toBeInTheDocument()
    expect(screen.getByText('1,440 kg')).toBeInTheDocument()
  })

  it('should handle form validation errors', async () => {
    const errorState = {
      ok: false,
      error: 'Invalid input',
      issues: {
        fieldErrors: {
          weeklyMilesDriven: ['Must be a positive number'],
          electricityKwhPerMonth: ['Must be between 0 and 20000'],
        },
      },
    }
    
    mockUseActionState.mockReturnValue([errorState, mockFormAction, false])
    
    render(<QuizPage />)
    
    expect(screen.getByText('There was an error with your input.')).toBeInTheDocument()
  })

  it('should handle missing carbon estimate gracefully', async () => {
    const successStateWithoutEstimate = {
      ok: true,
      data: {
        quiz: {
          diet: 'vegan',
          weeklyMilesDriven: 0,
          electricityKwhPerMonth: 200,
          homeHeating: 'other',
          flightsShortHaulPerYear: 0,
          recyclingHabit: 'always',
          transportMode: 'bike_walk',
        },
        location: {
          city: 'Seattle',
          region: 'WA',
          country: 'US',
        },
        estimate: null,
        tips: '• Great job on being vegan!\n• Consider installing solar panels\n• Keep up the zero-waste lifestyle',
      },
    }
    
    mockUseActionState.mockReturnValue([successStateWithoutEstimate, mockFormAction, false])
    
    render(<QuizPage />)
    
    expect(screen.getByText('Could not retrieve carbon estimate. Showing tips only.')).toBeInTheDocument()
    expect(screen.getByText(/Great job on being vegan!/)).toBeInTheDocument()
  })

  it('should handle empty location data', async () => {
    const successStateWithEmptyLocation = {
      ok: true,
      data: {
        quiz: {
          diet: 'omnivore',
          weeklyMilesDriven: 50,
          electricityKwhPerMonth: 400,
          homeHeating: 'electric',
          flightsShortHaulPerYear: 2,
          recyclingHabit: 'often',
          transportMode: 'mixed',
        },
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
        tips: '• Reduce your carbon footprint\n• Consider a plant-based diet\n• Use energy-efficient appliances',
      },
    }
    
    mockUseActionState.mockReturnValue([successStateWithEmptyLocation, mockFormAction, false])
    
    render(<QuizPage />)
    
    // Should still display results even with empty location
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('5,000 kg CO2e')).toBeInTheDocument()
    expect(screen.getByText(/Reduce your carbon footprint/)).toBeInTheDocument()
  })

  it('should handle form field interactions correctly', async () => {
    render(<QuizPage />)

    // Test diet selection
    const dietSelect = screen.getByLabelText(/diet/i)
    await user.selectOptions(dietSelect, 'vegan')
    expect(dietSelect).toHaveValue('vegan')

    // Test transport mode selection
    const transportSelect = screen.getByLabelText(/transport/i)
    await user.selectOptions(transportSelect, 'public_transit')
    expect(transportSelect).toHaveValue('public_transit')

    // Test number input
    const milesInput = screen.getByLabelText(/weekly miles driven/i)
    await user.clear(milesInput)
    await user.type(milesInput, '25')
    expect(milesInput).toHaveValue(25)

    // Test heating selection
    const heatingSelect = screen.getByLabelText(/heating/i)
    await user.selectOptions(heatingSelect, 'gas')
    expect(heatingSelect).toHaveValue('gas')

    // Test flights input
    const flightsInput = screen.getByLabelText(/short-haul flights per year/i)
    await user.clear(flightsInput)
    await user.type(flightsInput, '3')
    expect(flightsInput).toHaveValue(3)

    // Test recycling habit selection
    const recyclingSelect = screen.getByLabelText(/recycling habit/i)
    await user.selectOptions(recyclingSelect, 'rarely')
    expect(recyclingSelect).toHaveValue('rarely')
  })

  it('should maintain form state during loading', async () => {
    // Start with initial state
    mockUseActionState.mockReturnValue([null, mockFormAction, false])
    
    const { rerender } = render(<QuizPage />)
    
    // Fill out form
    await user.selectOptions(screen.getByLabelText(/diet/i), 'pescatarian')
    await user.clear(screen.getByLabelText(/weekly miles driven/i))
    await user.type(screen.getByLabelText(/weekly miles driven/i), '15')
    
    // Switch to loading state
    mockUseActionState.mockReturnValue([null, mockFormAction, true])
    rerender(<QuizPage />)
    
    // Form values should be preserved
    expect(screen.getByLabelText(/diet/i)).toHaveValue('pescatarian')
    expect(screen.getByLabelText(/weekly miles driven/i)).toHaveValue(15)
    
    // Button should be disabled
    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
  })
})
