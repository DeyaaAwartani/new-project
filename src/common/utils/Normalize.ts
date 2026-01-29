function normalizePhone(phone?: string): string | undefined {
  if (!phone) return undefined;

  // clean the spaces
  const cleaned = phone.replace(/[\s-]/g, '');

  // if local transform it to global
  if (/^07\d{8}$/.test(cleaned)) {
    return `+962${cleaned.slice(1)}`; // cut the zero
  }

  // if global test
  if (/^\+9627\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  // not Jordanian
  return undefined;
}
