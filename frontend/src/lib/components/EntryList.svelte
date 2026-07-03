<script lang="ts">
  import { insertNote } from '$lib/stores/entries.js';

  let { entries } = $props();

  const COLORS: Record<string, string> = { exercise: '#3FE1D0', music: '#FF3EA5', content: '#F5A623' };
  const LABELS: Record<string, string> = { exercise: 'Ejercicio', music: 'Música', content: 'Contenido' };

  let noteOpen   = $state<Record<string, boolean>>({});
  let noteContent = $state<Record<string, string>>({});
  let noteSaving  = $state<Record<string, boolean>>({});
  let noteError   = $state<Record<string, string>>({});
  let noteSaved   = $state<Record<string, boolean>>({});

  function toggleNote(id: string) {
    noteOpen[id] = !noteOpen[id];
    if (!noteOpen[id]) {
      noteContent[id] = '';
      noteError[id] = '';
      noteSaved[id] = false;
    }
  }

  async function saveNote(id: string) {
    const content = (noteContent[id] ?? '').trim();
    if (!content) return;

    noteSaving[id] = true;
    noteError[id] = '';
    try {
      await insertNote(id, content);
      noteSaved[id] = true;
      noteContent[id] = '';
      setTimeout(() => {
        noteOpen[id] = false;
        noteSaved[id] = false;
      }, 1500);
    } catch (err) {
      noteError[id] = err instanceof Error ? err.message : 'Error al guardar la nota';
    } finally {
      noteSaving[id] = false;
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
</script>


<div class="flex flex-col gap-2">
  {#each entries as entry (entry.id)}
    {@const color = COLORS[entry.category]}
    <div class="border border-border rounded bg-bg overflow-hidden">
      <div class="flex items-center gap-2.5 px-3 py-2.5">
        <span
          class="w-2 h-2 rounded-full flex-shrink-0"
          style="background: {color}"
        ></span>

        <div class="flex-1 min-w-0">
          <span class="block text-[13px] font-semibold" style="color: {color}">
            {LABELS[entry.category]}
          </span>
          <span class="block text-[10.5px] font-mono text-muted">
            {formatTime(entry.occurred_at)}
          </span>
        </div>

        <span class="text-[12px] font-mono text-muted2 mr-2">
          {entry.duration_minutes} min
        </span>

        <button
          id="note-btn-{entry.id}"
          onclick={() => toggleNote(entry.id)}
          title={noteOpen[entry.id] ? "Cancelar nota" : "Añadir nota"}
          class="text-muted hover:text-muted2 transition-colors p-0.5"
        >
          {#if noteOpen[entry.id]}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-3.5 h-3.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          {:else}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-3.5 h-3.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          {/if}
        </button>
      </div>

      {#if noteOpen[entry.id]}
        <div
          class="border-t border-border px-3 py-2 bg-panel/50 animate-screen-in"
        >
          {#if noteSaved[entry.id]}
            <p class="text-exercise text-xs font-mono py-1">Nota guardada ✓</p>
          {:else}
            <div class="flex gap-2 items-start">
              <textarea
                id="note-input-{entry.id}"
                bind:value={noteContent[entry.id]}
                placeholder="Escribe tu nota…"
                rows="2"
                disabled={noteSaving[entry.id]}
                class="
                  flex-1 bg-transparent text-xs font-mono text-text placeholder:text-muted
                  resize-none focus:outline-none disabled:opacity-50
                "
                onkeydown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    saveNote(entry.id);
                }}
              ></textarea>
              <button
                id="note-save-{entry.id}"
                onclick={() => saveNote(entry.id)}
                disabled={noteSaving[entry.id] ||
                  !(noteContent[entry.id] ?? "").trim()}
                class="
                  text-[10px] font-mono text-muted2 border border-border rounded px-2 py-1
                  hover:border-muted/60 disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors shrink-0 mt-0.5
                "
              >
                {noteSaving[entry.id] ? "…" : "Guardar"}
              </button>
            </div>
            {#if noteError[entry.id]}
              <p class="text-music text-[10px] font-mono mt-1">
                {noteError[entry.id]}
              </p>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
