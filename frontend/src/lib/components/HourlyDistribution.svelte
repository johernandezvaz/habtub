<script lang="ts">
  type Entry = {
    id: string;
    category: string;
    duration_minutes: number;
    occurred_at: string;
  };
  let { entries }: { entries: Entry[] } = $props();

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const hourBuckets = $derived.by(() => {
    const counts = new Array(24).fill(0);
    for (const e of entries) {
      const h = new Date(e.occurred_at).getHours();
      counts[h]++;
    }
    const max = Math.max(...counts, 1);
    return counts.map((count, h) => ({ h, count, pct: count / max }));
  });

  const totalEntries = $derived(entries.length);

  const peakHour = $derived(
    hourBuckets.reduce(
      (best, cur) => (cur.count > best.count ? cur : best),
      hourBuckets[0],
    ),
  );
</script>

<div class="border border-border rounded bg-panel p-4">
  <span class="font-mono text-[9.5px] tracking-[0.12em] text-muted block mb-1">
    DISTRIBUCIÓN HORARIA
  </span>

  {#if totalEntries === 0}
    <p class="text-muted text-xs font-mono text-center py-8">Sin datos aún</p>
  {:else}
    <p class="text-[10px] font-mono text-muted2 mb-3">
      Hora pico:
      <span class="text-text font-bold">
        {String(peakHour.h).padStart(2, "0")}:00
      </span>
      <span class="text-muted">({peakHour.count} entradas)</span>
    </p>

    <div class="flex gap-[3px] items-end" style="height:56px">
      {#each hourBuckets as { h, count, pct }}
        <div
          class="flex-1 rounded-t-[2px] transition-all duration-300"
          style="
            height: {Math.max(pct * 100, count > 0 ? 6 : 3)}%;
            background: {count > 0 ? '#3FE1D0' : '#2A2F37'};
            opacity: {count > 0 ? 0.35 + pct * 0.65 : 1};
            min-height: 3px;
          "
          title="{String(h).padStart(2, '0')}:00 — {count} {count === 1
            ? 'entrada'
            : 'entradas'}"
        ></div>
      {/each}
    </div>

    <div class="flex mt-1.5">
      {#each HOURS as h}
        <div class="flex-1 text-center">
          {#if h % 6 === 0}
            <span class="text-[7.5px] font-mono text-muted leading-none"
              >{h}</span
            >
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
