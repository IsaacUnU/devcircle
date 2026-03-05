import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, createPostSchema } from '@/lib/validations'

describe('loginSchema', () => {
  it('validates correct credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'pass123' })
    expect(result.success).toBe(true)
  })
  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'pass123' })
    expect(result.success).toBe(false)
  })
  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: '123' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('validates correct registration data', () => {
    const result = registerSchema.safeParse({
      email: 'user@test.com', username: 'testuser',
      name: 'Test User', password: 'password123'
    })
    expect(result.success).toBe(true)
  })
  it('rejects username with spaces', () => {
    const result = registerSchema.safeParse({
      email: 'user@test.com', username: 'test user',
      name: 'Test User', password: 'password123'
    })
    expect(result.success).toBe(false)
  })
  it('rejects username too short', () => {
    const result = registerSchema.safeParse({
      email: 'user@test.com', username: 'ab',
      name: 'Test User', password: 'password123'
    })
    expect(result.success).toBe(false)
  })
})

describe('createPostSchema', () => {
  it('validates minimal post', () => {
    const result = createPostSchema.safeParse({ content: 'Hello world!' })
    expect(result.success).toBe(true)
  })
  it('rejects empty content', () => {
    const result = createPostSchema.safeParse({ content: '' })
    expect(result.success).toBe(false)
  })
  it('rejects too many tags', () => {
    const result = createPostSchema.safeParse({
      content: 'Hello',
      tags: ['a', 'b', 'c', 'd', 'e', 'f']
    })
    expect(result.success).toBe(false)
  })
})
