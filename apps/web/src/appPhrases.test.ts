import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { APP_TEXT, isAppKey } from './appPhrases'

describe('app phrases', () => {
  it('match the sentences the laptop speaks', () => {
    const source = readFileSync(new URL('../../server/navigation/phrases.py', import.meta.url), 'utf8')
    const block = source.slice(source.indexOf('APP_PHRASES = {'), source.indexOf('}', source.indexOf('APP_PHRASES = {')))
    const server = Object.fromEntries([...block.matchAll(/"([a-z0-9-]+)": "([^"]+)"/g)].map(m => [m[1], m[2]]))
    expect(server).toEqual(APP_TEXT)
  })
  it('never collide with route phrase keys', () => {
    for (const key of Object.keys(APP_TEXT)) expect(isAppKey(key)).toBe(true)
    for (const key of ['origin-instruction', 's0-hazard-0', 's1-watch', 'arrival', 'vision-down']) expect(isAppKey(key)).toBe(false)
  })
})
