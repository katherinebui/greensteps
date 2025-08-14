import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'
import path from 'path'

// Set up path mapping for tests
vi.stubGlobal('__dirname', path.resolve())

// Mock environment variables
vi.stubEnv('CARBON_INTERFACE_API_KEY', 'test-carbon-key')
vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')
vi.stubEnv('NEXT_PUBLIC_GEO_PROVIDER', 'geojs')

// Mock fetch globally
global.fetch = vi.fn()

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock server actions
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useActionState: vi.fn(() => [null, vi.fn(), false]),
  }
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})
