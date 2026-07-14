export const money = (value) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
export const dateShort = (value) => value ? new Intl.DateTimeFormat('pt-PT').format(new Date(value)) : '—';
export const percent = (value) => `${Math.max(0, Math.min(100, Number(value || 0))).toFixed(0)}%`;
