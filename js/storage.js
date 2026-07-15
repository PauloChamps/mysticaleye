const PREFIX = 'loorebee:';
export const preferences = {
  get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(PREFIX + key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(PREFIX + key, JSON.stringify(value)); },
  remove(key) { localStorage.removeItem(PREFIX + key); }
};
