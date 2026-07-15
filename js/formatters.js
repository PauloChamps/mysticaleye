export const money = (value) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
export const dateShort = (value) => value ? new Intl.DateTimeFormat('pt-PT').format(new Date(value)) : '—';
export const dateLong = (value = new Date()) => new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
export const percent = (value) => `${Math.max(0, Math.min(100, Number(value || 0))).toFixed(0)}%`;
export const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
export const initials = (name = '') => String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'LB';
