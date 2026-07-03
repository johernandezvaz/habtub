import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase.js';

/**
 * @typedef {{
 *   id:         string,
 *   label:      string,
 *   color:      string,
 *   icon_key:   string,
 *   sort_order: number
 * }} Module
 */

const _modules = writable(/** @type {Module[]} */([]));
export const modules = { subscribe: _modules.subscribe };


export async function fetchModules() {
  const { data, error } = await supabase
    .from('modules')
    .select('id, label, color, icon_key, sort_order')
    .order('sort_order', { ascending: true });

  if (!error && data) _modules.set(data);
}
