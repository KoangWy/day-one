/**
 * Sentences that belong to the app rather than a route. The laptop speaks the same keys from
 * apps/server/navigation/phrases.py (APP_PHRASES); a unit test keeps the two copies identical.
 */
export const APP_TEXT: Record<string, string> = {
  'setup-1': 'Before you start, hang your phone at chest height.',
  'setup-2': 'Keep the camera facing forward, and uncovered.',
  'setup-3': 'Turn the sound on, and keep one ear free.',
  'setup-4': 'And keep using your cane.',
  'obstacle-person': 'Be careful. Someone is in front of you.',
  'obstacle-object': 'Be careful. Something is in your path.',
  'teach-recording': 'Recording started.',
  'teach-learning': 'Learning.',
  'teach-learned': 'Route learned.',
  'teach-failed': 'The route could not be learned. Check the screen for details.',
}

/** Route phrase keys start with origin-, s0-… or name a route event; never these prefixes. */
export const isAppKey = (key: string) => /^(setup|obstacle|teach)-/.test(key)
