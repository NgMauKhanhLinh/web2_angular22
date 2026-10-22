/** Uniform "12/10 – 18/10/2026" formatting for every staff week selector. */
export function formatStaffWeekRange(monday: string): string {
  const start = new Date(monday + 'T00:00:00Z');
  const sunday = new Date(start.getTime() + 6 * 86_400_000);
  const short = (date: Date): string =>
    String(date.getUTCDate()).padStart(2, '0') + '/' +
    String(date.getUTCMonth() + 1).padStart(2, '0');
  return short(start) + ' – ' + short(sunday) + '/' + sunday.getUTCFullYear();
}
