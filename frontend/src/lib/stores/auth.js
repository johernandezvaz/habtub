
import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase.js';

export const session = writable(/** @type {import('@supabase/supabase-js').Session | null} */(null));
export const authLoading = writable(true);

supabase.auth.getSession().then(({ data }) => {
  session.set(data.session);
  authLoading.set(false);
});


supabase.auth.onAuthStateChange((_event, newSession) => {
  session.set(newSession);
  authLoading.set(false);
});


/**
 * Envía un magic link al email dado.
 * @param {string} email
 * @returns {Promise<{ error: import('@supabase/supabase-js').AuthError | null }>}
 */
export async function signInWithOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  return { error };
}

export async function signOut() {
  await supabase.auth.signOut();
}
