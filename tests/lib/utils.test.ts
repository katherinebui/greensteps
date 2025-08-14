import { describe, it, expect } from 'vitest'
import { cn } from '../../lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('px-4 py-2', 'px-6')).toBe('py-2 px-6')
    expect(cn('bg-red-500', 'bg-blue-500', 'bg-green-500')).toBe('bg-green-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
  })

  it('should handle arrays and objects', () => {
    expect(cn(['class1', 'class2'], { class3: true, class4: false })).toBe('class1 class2 class3')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(null, undefined)).toBe('')
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      'text-red-500',
      { 'bg-blue-500': true, 'text-green-500': false },
      ['px-4', 'py-2'],
      'text-blue-500' // should override text-red-500
    )
    expect(result).toBe('base-class bg-blue-500 px-4 py-2 text-blue-500')
  })
})
