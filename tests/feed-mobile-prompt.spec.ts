import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const feedPage = readFileSync(resolve(process.cwd(), 'src/pages/FeedPage.vue'), 'utf8')

describe('FeedPage mobile create prompt', () => {
  it('limits the placeholder height and reduces the prompt spacing on small screens', () => {
    const mobileStyles = feedPage.match(/@media\s*\(max-width:\s*480px\)\s*\{([\s\S]*?)<\/style>/)?.[1]

    expect(mobileStyles).toBeDefined()
    expect(mobileStyles).toMatch(/-webkit-line-clamp:\s*2/)
    expect(mobileStyles).toMatch(/padding:\s*0\.625rem\s+0\.75rem/)
    expect(mobileStyles).toMatch(/min-width:\s*0/)
  })
})
