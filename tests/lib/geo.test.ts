import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lookupGeo } from '../../lib/geo'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('lookupGeo function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return location data from ipinfo when configured', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    process.env.NEXT_PUBLIC_GEO_PROVIDER = 'ipinfo'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ip: '192.168.1.1',
        city: 'San Francisco',
        region: 'CA',
        country: 'US',
      }),
    })

    const result = await lookupGeo()

    expect(result).toEqual({
      ip: '192.168.1.1',
      city: 'San Francisco',
      region: 'CA',
      country: 'US',
    })

    expect(mockFetch).toHaveBeenCalledWith('https://ipinfo.io/json', {
      cache: 'no-store',
    })

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    } else {
      delete process.env.NEXT_PUBLIC_GEO_PROVIDER
    }
  })

  it('should return location data from geojs by default', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    delete process.env.NEXT_PUBLIC_GEO_PROVIDER

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ip: '10.0.0.1',
        city: 'New York',
        region: 'NY',
        country: 'US',
      }),
    })

    const result = await lookupGeo()

    expect(result).toEqual({
      ip: '10.0.0.1',
      city: 'New York',
      region: 'NY',
      country: 'US',
    })

    expect(mockFetch).toHaveBeenCalledWith('https://get.geojs.io/v1/ip/geo.json', {
      cache: 'no-store',
    })

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    }
  })

  it('should handle ipinfo API failure gracefully', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    process.env.NEXT_PUBLIC_GEO_PROVIDER = 'ipinfo'

    mockFetch.mockRejectedValueOnce(new Error('ipinfo failed'))

    const result = await lookupGeo()

    expect(result).toEqual({})

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    } else {
      delete process.env.NEXT_PUBLIC_GEO_PROVIDER
    }
  })

  it('should handle ipinfo non-ok response', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    process.env.NEXT_PUBLIC_GEO_PROVIDER = 'ipinfo'

    mockFetch.mockResolvedValueOnce({
      ok: false,
    })

    const result = await lookupGeo()

    expect(result).toEqual({})

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    } else {
      delete process.env.NEXT_PUBLIC_GEO_PROVIDER
    }
  })

  it('should handle geojs API failure gracefully', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    delete process.env.NEXT_PUBLIC_GEO_PROVIDER

    mockFetch.mockRejectedValueOnce(new Error('geojs failed'))

    const result = await lookupGeo()

    expect(result).toEqual({})

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    }
  })

  it('should handle geojs non-ok response', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    delete process.env.NEXT_PUBLIC_GEO_PROVIDER

    mockFetch.mockResolvedValueOnce({
      ok: false,
    })

    const result = await lookupGeo()

    expect(result).toEqual({})

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    }
  })

  it('should handle partial location data from ipinfo', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    process.env.NEXT_PUBLIC_GEO_PROVIDER = 'ipinfo'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ip: '192.168.1.1',
        city: 'San Francisco',
        // missing region and country
      }),
    })

    const result = await lookupGeo()

    expect(result).toEqual({
      ip: '192.168.1.1',
      city: 'San Francisco',
    })

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    } else {
      delete process.env.NEXT_PUBLIC_GEO_PROVIDER
    }
  })

  it('should handle partial location data from geojs', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    delete process.env.NEXT_PUBLIC_GEO_PROVIDER

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ip: '10.0.0.1',
        country: 'US',
        // missing city and region
      }),
    })

    const result = await lookupGeo()

    expect(result).toEqual({
      ip: '10.0.0.1',
      country: 'US',
    })

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    }
  })

  it('should handle empty response from ipinfo', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    process.env.NEXT_PUBLIC_GEO_PROVIDER = 'ipinfo'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const result = await lookupGeo()

    expect(result).toEqual({})

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    } else {
      delete process.env.NEXT_PUBLIC_GEO_PROVIDER
    }
  })

  it('should handle empty response from geojs', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    delete process.env.NEXT_PUBLIC_GEO_PROVIDER

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const result = await lookupGeo()

    expect(result).toEqual({})

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    }
  })

  it('should handle JSON parsing errors', async () => {
    const originalProvider = process.env.NEXT_PUBLIC_GEO_PROVIDER
    process.env.NEXT_PUBLIC_GEO_PROVIDER = 'ipinfo'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    })

    const result = await lookupGeo()

    expect(result).toEqual({})

    // Restore original provider
    if (originalProvider) {
      process.env.NEXT_PUBLIC_GEO_PROVIDER = originalProvider
    } else {
      delete process.env.NEXT_PUBLIC_GEO_PROVIDER
    }
  })
})
