import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceDirectory = resolve(process.cwd(), 'src')

function getSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return getSourceFiles(path)
    return /\.(vue|ts)$/.test(entry.name) ? [path] : []
  })
}

describe('Font Awesome icon policy', () => {
  it('uses Font Awesome instead of emoji, Lucide, or inline SVG icons', () => {
    const sourceFiles = getSourceFiles(sourceDirectory)
    const emojiPattern = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u

    for (const file of sourceFiles) {
      const source = readFileSync(file, 'utf8')
      expect(source, file).not.toMatch(emojiPattern)
      expect(source, file).not.toMatch(/@lucide\/vue|lucide-vue-next/)
      expect(source, file).not.toMatch(/<svg\b/i)
    }
  })
})
