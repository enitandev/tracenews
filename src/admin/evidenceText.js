/**
 * Monitoring Spirit evidence as staff-readable text. The API sends a list of
 * rows ({ type, label, detail }); older payloads sent a string. Rendering the
 * list directly crashed the Desk (React cannot render plain objects).
 */
export function evidenceText(evidence, fallback = '') {
  if (!evidence) return fallback;
  if (typeof evidence === 'string') return evidence;
  if (Array.isArray(evidence)) {
    const parts = evidence
      .map(e => (typeof e === 'string' ? e : e && (e.detail || e.label || e.type)))
      .filter(Boolean);
    return parts.length ? parts.join(' · ') : fallback;
  }
  return evidence.detail || evidence.label || fallback;
}
