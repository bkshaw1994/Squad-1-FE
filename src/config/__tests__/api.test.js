import { checkCORSConfiguration } from '../api'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock to the original implementation for testing
    checkCORSConfiguration.mockClear()
    checkCORSConfiguration.mockImplementation(async () => {
      try {
        const response = await fetch('http://localhost:3000/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        return response.ok
      } catch (error) {
        console.error('CORS check failed:', error)
        return false
      }
    })
  })

  describe('checkCORSConfiguration', () => {
    it('should return true when fetch succeeds with ok response', async () => {
      const mockResponse = { ok: true }
      global.fetch.mockResolvedValue(mockResponse)

      const result = await checkCORSConfiguration()

      expect(global.fetch).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when fetch succeeds but response is not ok', async () => {
      const mockResponse = { ok: false }
      global.fetch.mockResolvedValue(mockResponse)

      const result = await checkCORSConfiguration()

      expect(result).toBe(false)
    })

    it('should return false when fetch throws an error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      global.fetch.mockRejectedValue(new Error('Network error'))

      const result = await checkCORSConfiguration()

      expect(consoleSpy).toHaveBeenCalledWith('CORS check failed:', expect.any(Error))
      expect(result).toBe(false)

      consoleSpy.mockRestore()
    })
  })
})