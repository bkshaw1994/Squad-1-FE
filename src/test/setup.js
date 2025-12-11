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

// Mock window.alert and window.confirm
global.alert = jest.fn()
global.confirm = jest.fn()

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