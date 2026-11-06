import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
const faviconPath = resolve(process.cwd(), 'public/favicon.svg')

describe('site favicon', () => {
  it('uses the Iclean leaf icon instead of the Vue template icon', () => {
    expect(indexHtml).toContain('href="/favicon.svg"')
    expect(indexHtml).not.toContain('vue.svg')
    expect(existsSync(faviconPath)).toBe(true)
    expect(readFileSync(faviconPath, 'utf8')).toContain('<svg')
  })
})
