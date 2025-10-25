export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
export function toISO(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}
export function formatDateID(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}
export function getWeekdayShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { weekday: 'short' });
}