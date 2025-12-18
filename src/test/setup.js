import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill TextEncoder/TextDecoder for jest-environment-jsdom
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Cleanup after each test case
afterEach(() => {
  cleanup()
  localStorage.clear()
  jest.clearAllMocks()
})

// Mock environment variables
process.env.VITE_API_BASE_URL = 'http://localhost:3000'

// Mock import.meta for Vite environment variables
global.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000'
    }
  }
}

// Mock the API config module
jest.mock('../config/api', () => ({
  API_BASE_URL: 'http://localhost:3000',
  checkCORSConfiguration: jest.fn().mockResolvedValue(true)
}))

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})