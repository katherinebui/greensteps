import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuizPage from '../../../app/quiz/page'

// Mock the server action
vi.mock('../../../app/actions', () => ({
  processQuizAction: vi.fn(),
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

describe('QuizPage', () => {
  const mockFormAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseActionState.mockReturnValue([null, mockFormAction, false])
  })

  it('should render the quiz form', () => {
    render(<QuizPage />)
    
    expect(screen.getByText('Lifestyle Quiz')).toBeInTheDocument()
    expect(screen.getByRole('form')).toBeInTheDocument()
  })

  it('should render all form fieldsets', () => {
    render(<QuizPage />)
    
    expect(screen.getByText('Diet')).toBeInTheDocument()
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Home Energy')).toBeInTheDocument()
    expect(screen.getByText('Flights & Waste')).toBeInTheDocument()
  })

  it('should render diet select with correct options', () => {
    render(<QuizPage />)
    
    const dietSelect = screen.getByRole('combobox', { name: /diet/i })
    expect(dietSelect).toBeInTheDocument()
    expect(dietSelect).toHaveValue('omnivore')
    
    const options = screen.getAllByRole('option')
    const dietOptions = options.filter(option => 
      ['omnivore', 'vegetarian', 'vegan', 'pescatarian'].includes(option.getAttribute('value') || '')
    )
    expect(dietOptions).toHaveLength(4)
  })

  it('should render transport mode select with correct options', () => {
    render(<QuizPage />)
    
    const transportSelect = screen.getByRole('combobox', { name: /transport/i })
    expect(transportSelect).toBeInTheDocument()
    expect(transportSelect).toHaveValue('mixed')
    
    const options = screen.getAllByRole('option')
    const transportOptions = options.filter(option => 
      ['car', 'public_transit', 'bike_walk', 'mixed'].includes(option.getAttribute('value') || '')
    )
    expect(transportOptions).toHaveLength(4)
  })

  it('should render weekly miles input with correct attributes', () => {
    render(<QuizPage />)
    
    const milesInput = screen.getByRole('spinbutton', { name: /weekly miles driven/i })
    expect(milesInput).toBeInTheDocument()
    expect(milesInput).toHaveAttribute('type', 'number')
    expect(milesInput).toHaveAttribute('min', '0')
    expect(milesInput).toHaveAttribute('step', '1')
    expect(milesInput).toHaveValue(50)
  })

  it('should render electricity input with correct attributes', () => {
    render(<QuizPage />)
    
    const electricityInput = screen.getByRole('spinbutton', { name: /electricity/i })
    expect(electricityInput).toBeInTheDocument()
    expect(electricityInput).toHaveAttribute('type', 'number')
    expect(electricityInput).toHaveAttribute('min', '0')
    expect(electricityInput).toHaveAttribute('step', '1')
    expect(electricityInput).toHaveValue(400)
  })

  it('should render home heating select with correct options', () => {
    render(<QuizPage />)
    
    const heatingSelect = screen.getByRole('combobox', { name: /heating/i })
    expect(heatingSelect).toBeInTheDocument()
    expect(heatingSelect).toHaveValue('electric')
    
    const options = screen.getAllByRole('option')
    const heatingOptions = options.filter(option => 
      ['gas', 'electric', 'heat_pump', 'other'].includes(option.getAttribute('value') || '')
    )
    expect(heatingOptions).toHaveLength(4)
  })

  it('should render flights input with correct attributes', () => {
    render(<QuizPage />)
    
    const flightsInput = screen.getByRole('spinbutton', { name: /short-haul flights per year/i })
    expect(flightsInput).toBeInTheDocument()
    expect(flightsInput).toHaveAttribute('type', 'number')
    expect(flightsInput).toHaveAttribute('min', '0')
    expect(flightsInput).toHaveAttribute('step', '1')
    expect(flightsInput).toHaveValue(0)
  })

  it('should render recycling habit select with correct options', () => {
    render(<QuizPage />)
    
    const recyclingSelect = screen.getByRole('combobox', { name: /recycling habit/i })
    expect(recyclingSelect).toBeInTheDocument()
    expect(recyclingSelect).toHaveValue('often')
    
    const options = screen.getAllByRole('option')
    const recyclingOptions = options.filter(option => 
      ['rarely', 'sometimes', 'often', 'always'].includes(option.getAttribute('value') || '')
    )
    expect(recyclingOptions).toHaveLength(4)
  })

  it('should render submit button', () => {
    render(<QuizPage />)
    
    const submitButton = screen.getByRole('button', { name: /get results/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should show loading state when form is pending', () => {
    mockUseActionState.mockReturnValue([null, mockFormAction, true])
    
    render(<QuizPage />)
    
    const submitButton = screen.getByRole('button', { name: /calculating/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should display error message when state has error', () => {
    const errorState = {
      ok: false,
      error: 'Invalid input',
      issues: { fieldErrors: { diet: ['Invalid diet'] } },
    }
    mockUseActionState.mockReturnValue([errorState, mockFormAction, false])
    
    render(<QuizPage />)
    
    expect(screen.getByText('There was an error with your input.')).toBeInTheDocument()
  })

  it('should display results when state has successful data', () => {
    const successState = {
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
        location: {
          city: 'San Francisco',
          region: 'CA',
          country: 'US',
        },
        estimate: {
          kg: 5000,
          breakdown: {
            driving: 2100,
            electricity: 1920,
            heating: 700,
            flights: 500,
          },
        },
        tips: 'Here are some sustainability tips...',
      },
    }
    mockUseActionState.mockReturnValue([successState, mockFormAction, false])
    
    render(<QuizPage />)
    
    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText('5,000 kg CO2e')).toBeInTheDocument()
    expect(screen.getByText('AI Tips')).toBeInTheDocument()
    expect(screen.getByText('Here are some sustainability tips...')).toBeInTheDocument()
  })

  it('should display breakdown data correctly', () => {
    const successState = {
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
        location: {
          city: 'San Francisco',
          region: 'CA',
          country: 'US',
        },
        estimate: {
          kg: 5000,
          breakdown: {
            driving: 2100,
            electricity: 1920,
            heating: 700,
            flights: 500,
          },
        },
        tips: 'Tips...',
      },
    }
    mockUseActionState.mockReturnValue([successState, mockFormAction, false])
    
    render(<QuizPage />)
    
    expect(screen.getByText('Driving')).toBeInTheDocument()
    expect(screen.getByText('2,100 kg')).toBeInTheDocument()
    expect(screen.getByText('Electricity')).toBeInTheDocument()
    expect(screen.getByText('1,920 kg')).toBeInTheDocument()
    expect(screen.getByText('Heating')).toBeInTheDocument()
    expect(screen.getByText('700 kg')).toBeInTheDocument()
    expect(screen.getByText('Flights')).toBeInTheDocument()
    expect(screen.getByText('500 kg')).toBeInTheDocument()
  })

  it('should handle missing estimate data', () => {
    const successState = {
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
        location: {
          city: 'San Francisco',
          region: 'CA',
          country: 'US',
        },
        estimate: null,
        tips: 'Tips without carbon data...',
      },
    }
    mockUseActionState.mockReturnValue([successState, mockFormAction, false])
    
    render(<QuizPage />)
    
    expect(screen.getByText('Could not retrieve carbon estimate. Showing tips only.')).toBeInTheDocument()
    expect(screen.getByText('Tips without carbon data...')).toBeInTheDocument()
  })

  it('should have proper form structure', () => {
    render(<QuizPage />)
    
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    
    // Check that all required fields are present
    expect(screen.getByRole('combobox', { name: /diet/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /transport/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /weekly miles driven/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /electricity/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /heating/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /short-haul flights per year/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /recycling habit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /get results/i })).toBeInTheDocument()
  })

  it('should have accessible form labels', () => {
    render(<QuizPage />)
    
    // Check that all form controls have proper labels
    expect(screen.getByLabelText(/diet/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/transport/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/weekly miles driven/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/electricity/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/heating/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/short-haul flights per year/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/recycling habit/i)).toBeInTheDocument()
  })
})
