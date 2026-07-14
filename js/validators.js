export function sanitizeText(value) {
  return String(value ?? '').replace(/[<>]/g, '').trim();
}
export function requireFields(payload, fields) {
  return fields.reduce((errors, field) => {
    if (!String(payload[field] ?? '').trim()) errors[field] = 'Campo obrigatório.';
    return errors;
  }, {});
}
