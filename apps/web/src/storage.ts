/** Per-phone preferences only (setup seen, chosen route, obstacle alerts). Private mode may refuse. */
export function load(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
export function save(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* private mode */ }
}
