import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('Design System Tokens in main.css', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/assets/main.css'), 'utf-8')

  it('declares 4px radius token', () => {
    expect(css).toMatch(/--radius:\s*0\.25rem/)
  })

  it('does not contain glowing box-shadows or green neon box-shadows', () => {
    expect(css).not.toMatch(/box-shadow:[^;]*rgba\(\s*22\s*,\s*163\s*,\s*74/i)
  })

  it('defines card-ds and button utility styles with 4px radius', () => {
    expect(css).toMatch(/\.card-ds\b/)
    expect(css).toMatch(/border-radius:\s*(0\.25rem|var\(--radius\)|4px)/)
  })
})

describe('Auth pages design system adherence', () => {
  const login = readFileSync(resolve(process.cwd(), 'src/pages/LoginPage.vue'), 'utf-8')
  const register = readFileSync(resolve(process.cwd(), 'src/pages/RegisterPage.vue'), 'utf-8')

  it('LoginPage does not have neon green focus glow or colored box-shadows', () => {
    expect(login).not.toMatch(/rgba\(\s*22\s*,\s*163\s*,\s*74/i)
    expect(login).not.toMatch(/class="particle"/)
  })

  it('RegisterPage does not have neon green focus glow or colored box-shadows', () => {
    expect(register).not.toMatch(/rgba\(\s*22\s*,\s*163\s*,\s*74/i)
    expect(register).not.toMatch(/class="particle"/)
  })
})
