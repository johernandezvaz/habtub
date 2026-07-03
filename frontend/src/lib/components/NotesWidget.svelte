<script lang="ts">
  import { notes } from '$lib/stores/entries.js';

  const COLORS: Record<string, string> = {
    exercise: '#3FE1D0',
    music:    '#FF3EA5',
    content:  '#F5A623',
  };
  const LABELS: Record<string, string> = {
    exercise: 'Ejercicio',
    music:    'Música',
    content:  'Contenido',
  };

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  }
</script>

<div class="border border-border rounded bg-panel p-4">
  <span class="font-mono text-[9.5px] tracking-[0.12em] text-muted block mb-3">
    ÚLTIMAS NOTAS
  </span>

  {#if $notes.length === 0}
    <p class="text-muted text-xs font-mono text-center py-6">Sin notas registradas</p>
  {:else}
    <div class="flex flex-col gap-2">
      {#each $notes.slice(0, 5) as note (note.id)}
        {@const cat   = note.entries?.category ?? 'exercise'}
        {@const color = COLORS[cat] ?? '#5A5F66'}
        {@const label = LABELS[cat] ?? cat}
        <div class="border border-border rounded bg-bg px-3 py-2.5">
          <div class="flex items-center gap-2 mb-1">
            <div
              class="w-1.5 h-1.5 rounded-full shrink-0"
              style="background: {color}"
            ></div>
            <span class="text-[10px] font-mono text-muted">
              {label} · {fmt(note.created_at)}
            </span>
          </div>
          <p class="text-xs text-text leading-relaxed line-clamp-2">{note.content}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>
