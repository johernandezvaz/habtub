import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase.js';

const _entries = writable(/** @type {Entry[]} */([]));
const _notes = writable(/** @type {Note[]}  */([]));

/** @typedef {{ id: string, entry_id: string|null, content: string, created_at: string, entries?: { category: string } }} Note */
const _loading = writable(false);
const _error = writable(/** @type {string | null} */(null));

/** @typedef {{ id: string, category: string, duration_minutes: number, occurred_at: string, created_at?: string, metadata?: Record<string, unknown> }} Entry */

export const entries = { subscribe: _entries.subscribe };
export const notes = { subscribe: _notes.subscribe };
export const entriesLoading = { subscribe: _loading.subscribe };
export const entriesError = { subscribe: _error.subscribe };


export async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('id, entry_id, content, created_at, entries(category)')
    .order('created_at', { ascending: false })
    .limit(20);

  if (!error && data) _notes.set(data);
}

/**
 * Carga todas las entradas dentro de un rango de fechas.
 * Las fechas se pasan como objetos Date; se convierten a ISO para la query.
 *
 * @param {Date} from - inicio del rango (inclusive)
 * @param {Date} to   - fin del rango (inclusive)
 */
export async function fetchRange(from, to) {
  _loading.set(true);
  _error.set(null);

  const { data, error } = await supabase
    .from('entries')
    .select('id, category, duration_minutes, occurred_at, created_at')
    .gte('occurred_at', from.toISOString())
    .lte('occurred_at', to.toISOString())
    .order('occurred_at', { ascending: false });

  if (error) {
    _error.set(error.message);
    _loading.set(false);
    return;
  }

  _entries.set(data ?? []);
  _loading.set(false);
}

/**
 * Inserta una nueva entrada y la añade al store sin recargar.
 * RLS garantiza la seguridad; user_id es necesario por la constraint NOT NULL.
 *
 * @param {'exercise'|'music'|'content'} category
 * @param {number} duration_minutes
 * @returns {Promise<Entry>}
 * @throws {Error} si el insert falla
 */
/**
 * @param {string} category
 * @param {number} duration_minutes
 * @param {Record<string, unknown>} [metadata={}] — campos específicos del módulo (opcional)
 */
export async function insertEntry(category, duration_minutes, metadata = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const occurred_at = new Date().toISOString(); // UTC garantizado

  const { data, error } = await supabase
    .from('entries')
    .insert({ category, duration_minutes, occurred_at, user_id: user.id, metadata })
    .select('id, category, duration_minutes, occurred_at, created_at')
    .single();

  if (error) throw new Error(error.message);

  // Actualización optimista: prepend al store local sin recargar
  _entries.update((curr) => [data, ...curr]);

  return data;
}

/**
 * Inserta una nota vinculada a una entrada.
 * entry_id es nullable en el esquema (notas sueltas a futuro);
 * en esta UI siempre tendrá valor.
 *
 * @param {string} entryId - UUID de la entrada asociada
 * @param {string} content
 * @returns {Promise<object>}
 */
export async function insertNote(entryId, content) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('notes')
    .insert({
      entry_id: entryId,
      user_id: user.id,
      content,
    })
    .select('id, entry_id, content, created_at')
    .single();

  if (error) throw new Error(error.message);
  return data;
}
