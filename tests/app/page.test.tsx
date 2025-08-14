import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../../app/page'

describe('Home page', () => {
  it('should render the welcome message', () => {
    render(<Home />)
    
    expect(screen.getByText('Welcome to GreenSteps')).toBeInTheDocument()
  })

  it('should render the description text', () => {
    render(<Home />)
    
    expect(screen.getByText(/Take a quick lifestyle quiz to estimate your carbon footprint and get AI-powered tips/)).toBeInTheDocument()
  })

  it('should render the quiz link', () => {
    render(<Home />)
    
    const quizLink = screen.getByRole('link', { name: /Start the quiz/i })
    expect(quizLink).toBeInTheDocument()
    expect(quizLink).toHaveAttribute('href', '/quiz')
  })

  it('should have correct styling classes', () => {
    render(<Home />)
    
    const container = screen.getByText('Welcome to GreenSteps').parentElement
    expect(container).toHaveClass('space-y-4')
    
    const heading = screen.getByText('Welcome to GreenSteps')
    expect(heading).toHaveClass('text-xl', 'font-semibold')
    
    const description = screen.getByText(/Take a quick lifestyle quiz/)
    expect(description).toHaveClass('text-gray-600')
    
    const quizLink = screen.getByRole('link', { name: /Start the quiz/i })
    expect(quizLink).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'bg-green-600',
      'px-4',
      'py-2',
      'text-white',
      'hover:bg-green-700',
      'w-max'
    )
  })

  it('should render all required elements', () => {
    render(<Home />)
    
    // Check that all main elements are present
    expect(screen.getByText('Welcome to GreenSteps')).toBeInTheDocument()
    expect(screen.getByText(/Take a quick lifestyle quiz/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start the quiz/i })).toBeInTheDocument()
  })

  it('should have proper heading hierarchy', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Welcome to GreenSteps')
  })

  it('should have accessible link text', () => {
    render(<Home />)
    
    const link = screen.getByRole('link', { name: /Start the quiz/i })
    expect(link).toBeInTheDocument()
    expect(link.textContent).toBe('Start the quiz')
  })
})
