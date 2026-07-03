/**
 * Convierte una fecha a clave de día 'YYYY-MM-DD' usando la ZONA HORARIA LOCAL
 * del navegador (getFullYear/getMonth/getDate, no métodos UTC).
 * Esto es intencional: occurred_at se almacena en UTC, pero el "día" del usuario
 * depende de su timezone local (ej. Prague CET/CEST ±1/+2h).
 * NO usar date.toISOString().slice(0,10) — eso usa UTC y desplaza entradas
 * cercanas a medianoche al día equivocado.
 *
 * @param {Date} date
 * @returns {string}
 */
export function toDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** @param {Date} date @returns {boolean} */
export function isFutureDay(date) {
  return toDayKey(date) > toDayKey(new Date());
}

/** @param {Date} date @returns {Date} */
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** @param {Date} cursorDate */
export function getWeekRange(cursorDate) {
  const pivot = startOfDay(cursorDate);
  const dayOfWeek = (pivot.getDay() + 6) % 7;

  const start = new Date(pivot);
  start.setDate(pivot.getDate() - dayOfWeek);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return { start, end, days };
}

/** @param {Date} cursorDate */
export function getMonthRange(cursorDate) {
  const y = cursorDate.getFullYear();
  const mo = cursorDate.getMonth();

  const start = new Date(y, mo, 1);
  const end = new Date(y, mo + 1, 0);
  const count = end.getDate();

  const days = Array.from({ length: count }, (_, i) => new Date(y, mo, i + 1));

  return { start, end, days };
}

/** @param {number} year */
export function getYearMonthBuckets(year) {
  return Array.from({ length: 12 }, (_, mo) => {
    const count = new Date(year, mo + 1, 0).getDate();
    const days = Array.from({ length: count }, (_, i) => new Date(year, mo, i + 1));
    return { month: mo, days };
  });
}

/**
 * Agrupa entradas por clave de día local.
 * @param {Array<{occurred_at: string, [key: string]: any}>} entries
 * @returns {Map<string, any[]>}
 */
export function bucketEntriesByDay(entries) {
  const map = new Map();

  for (const entry of entries) {
    const key = toDayKey(new Date(entry.occurred_at));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
  }

  return map;
}
