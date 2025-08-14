import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateAdvice } from '../../lib/ai'
import { QuizAnswers } from '../../lib/types'

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}))

describe('generateAdvice function', () => {
  const mockQuiz: QuizAnswers = {
    diet: 'omnivore',
    weeklyMilesDriven: 50,
    electricityKwhPerMonth: 400,
    homeHeating: 'electric',
    flightsShortHaulPerYear: 2,
    recyclingHabit: 'often',
    transportMode: 'mixed',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate advice with all parameters', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Here are some tips:\n• Reduce meat consumption\n• Use public transport' } }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    const result = await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    expect(result).toContain('Here are some tips:')
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are GreenSteps, a sustainability coach. Provide concise, practical, location-aware advice with estimated impact. Use bullet points; 5-7 tips.',
        },
        {
          role: 'user',
          content: expect.stringContaining('Location: San Francisco, CA, US'),
        },
      ],
      temperature: 0.7,
    })
  })

  it('should handle missing OpenAI API key', async () => {
    // Temporarily remove the API key
    const originalKey = process.env.OPENAI_API_KEY
    delete process.env.OPENAI_API_KEY

    const result = await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    expect(result).toBe('Set OPENAI_API_KEY to enable AI-generated tips.')

    // Restore the API key
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey
    }
  })

  it('should use custom model when specified', async () => {
    const originalModel = process.env.OPENAI_MODEL
    process.env.OPENAI_MODEL = 'gpt-4'

    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Custom model tips' } }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4',
      })
    )

    // Restore original model
    if (originalModel) {
      process.env.OPENAI_MODEL = originalModel
    } else {
      delete process.env.OPENAI_MODEL
    }
  })

  it('should handle missing location summary', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Tips without location' } }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    await generateAdvice({
      quiz: mockQuiz,
      carbonKgPerYear: 5000,
    })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Location: Unknown'),
          }),
        ]),
      })
    )
  })

  it('should handle missing carbon footprint', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Tips without carbon data' } }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
    })

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Estimated Annual Footprint: N/A'),
          }),
        ]),
      })
    )
  })

  it('should include all quiz data in the prompt', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Tips' } }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    const userMessage = mockCreate.mock.calls[0][0].messages[1].content
    expect(userMessage).toContain('Diet: omnivore')
    expect(userMessage).toContain('Transport mode: mixed; weekly miles: 50')
    expect(userMessage).toContain('Electricity: 400 kWh/month; Heating: electric')
    expect(userMessage).toContain('Flights (short-haul/yr): 2')
    expect(userMessage).toContain('Recycling: often')
  })

  it('should handle OpenAI API errors gracefully', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockRejectedValue(new Error('API Error'))
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    const result = await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    expect(result).toBe('Unable to generate AI tips at this time.')
  })

  it('should handle empty response from OpenAI', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: '' } }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    const result = await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    expect(result).toBe('')
  })

  it('should handle missing choices in response', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    const result = await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    expect(result).toBe('')
  })

  it('should handle missing message content', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: {} }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    const result = await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    expect(result).toBe('')
  })

  it('should format carbon footprint correctly in prompt', async () => {
    const mockOpenAI = require('openai').default
    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Tips' } }],
    })
    mockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }))

    await generateAdvice({
      quiz: mockQuiz,
      locationSummary: 'San Francisco, CA, US',
      carbonKgPerYear: 5000,
    })

    const userMessage = mockCreate.mock.calls[0][0].messages[1].content
    expect(userMessage).toContain('Estimated Annual Footprint: 5000 kg CO2e')
  })
})
