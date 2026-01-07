import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateSlug,
  generateToken,
} from './queries'

describe('Query Helpers', () => {
  describe('generateSlug', () => {
    it('converts title to lowercase slug', () => {
      expect(generateSlug('My Great Story')).toBe('my-great-story')
    })

    it('removes special characters and unicode', () => {
      expect(generateSlug('Café München')).toBe('caf-m-nchen')
      expect(generateSlug('Hello! World?')).toBe('hello-world')
    })

    it('handles multiple spaces', () => {
      expect(generateSlug('Too   Many    Spaces')).toBe('too-many-spaces')
    })

    it('trims leading and trailing spaces', () => {
      expect(generateSlug('  Trimmed  ')).toBe('trimmed')
    })

    it('handles empty string', () => {
      expect(generateSlug('')).toBe('')
    })
  })

  describe('generateToken', () => {
    it('generates token of specified length', () => {
      const token = generateToken(32)
      expect(token).toHaveLength(32)
    })

    it('generates different tokens each time', () => {
      const token1 = generateToken(16)
      const token2 = generateToken(16)
      expect(token1).not.toBe(token2)
    })

    it('generates only alphanumeric characters', () => {
      const token = generateToken(50)
      expect(token).toMatch(/^[a-zA-Z0-9]+$/)
    })
  })
})
