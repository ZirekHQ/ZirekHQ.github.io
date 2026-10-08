const THEMES = new Set(['dark', 'light'])

const currentTheme = () => {
  const set = document.documentElement.dataset.theme
  if (THEMES.has(set)) return set
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const saveTheme = (theme) => {
  try { localStorage.setItem('theme', theme) } catch (_) {}
}

const initThemeToggle = () => {
  const button = document.getElementById('theme-toggle')
  if (!button) return
  const sync = () => button.setAttribute('aria-pressed', String(currentTheme() === 'dark'))
  button.hidden = false
  sync()
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    saveTheme(next)
    sync()
  })
}

initThemeToggle()
