<script lang="ts">
  import { signInWithOtp } from '$lib/stores/auth.js';

  let email = $state('');
  let sending = $state(false);
  let sent = $state(false);
  let errorMsg = $state('');

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    sending = true;
    errorMsg = "";

    const { error } = await signInWithOtp(email.trim());

    if (error) {
      errorMsg = error.message;
      sending = false;
      return;
    }

    sent = true;
    sending = false;
  }
</script>

<div class="flex flex-col items-center justify-center h-screen bg-bg px-6">
  <div class="mb-10 text-center">
    <p class="font-mono text-[10px] tracking-[0.15em] text-muted uppercase">
      Habtub
    </p>
    <h1 class="text-2xl font-bold text-text mt-1 tracking-tight">
      Accede a tu cuenta
    </h1>
    <p class="text-muted2 text-sm mt-2">
      Te enviamos un link mágico, sin contraseñas.
    </p>
  </div>

  <div class="w-full max-w-sm">
    {#if sent}
      <div
        class="border border-exercise/30 rounded bg-exercise/5 px-5 py-4 text-center animate-screen-in"
      >
        <p class="text-exercise text-sm font-semibold">Link enviado ✓</p>
        <p class="text-muted2 text-xs mt-1">
          Revisa tu correo y haz click en el enlace.
        </p>
        <button
          class="mt-4 text-muted text-xs underline underline-offset-2"
          onclick={() => {
            sent = false;
            email = "";
          }}
        >
          Usar otro email
        </button>
      </div>
    {:else}
      <form onsubmit={handleSubmit} class="flex flex-col gap-3">
        <input
          id="email-input"
          type="email"
          bind:value={email}
          placeholder="tu@email.com"
          required
          autocomplete="email"
          disabled={sending}
          class="
            w-full px-4 py-3 rounded border border-border bg-panel
            text-text text-sm font-mono placeholder:text-muted
            focus:outline-none focus:border-muted2
            disabled:opacity-50 transition-colors
          "
        />

        <button
          id="send-link-btn"
          type="submit"
          disabled={sending || !email.trim()}
          class="
            w-full py-3 rounded bg-text text-bg text-sm font-semibold
            hover:bg-muted2 active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          {sending ? "Enviando…" : "Enviarme el link"}
        </button>

        {#if errorMsg}
          <p class="text-music text-xs text-center mt-1 animate-screen-in">
            {errorMsg}
          </p>
        {/if}
      </form>
    {/if}
  </div>
</div>
