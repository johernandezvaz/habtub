<script lang="ts">
  import {
    toDayKey,
    getWeekRange,
    getMonthRange,
    bucketEntriesByDay,
  } from '$lib/utils/dates.js';

  type Entry = { id: string; category: string; duration_minutes: number; occurred_at: string };

  let { entries }: { entries: Entry[] } = $props();

  const COLORS: Record<string, string> = { exercise: '#3FE1D0', music: '#FF3EA5', content: '#F5A623' };
  const LABELS: Record<string, string> = { exercise: 'Ejercicio', music: 'Música', content: 'Contenido' };
  const CATS = ['exercise', 'music', 'content'] as const;

  type RangeType = 'week' | 'month' | 'year';
  let rangeType = $state<RangeType>('week');
  let cursor = $state(new Date());

  function shift(delta: number) {
    const d = new Date(cursor);
    if (rangeType === 'week') d.setDate(d.getDate() + delta * 7);
    else if (rangeType === 'month') d.setMonth(d.getMonth() + delta);
    else d.setFullYear(d.getFullYear() + delta);
    cursor = d;
  }

  const rangeEntries = $derived.by(() => {
    const byDay = bucketEntriesByDay(entries);
    let days: Date[] = [];

    if (rangeType === 'week') {
      days = getWeekRange(cursor).days;
    } else if (rangeType === 'month') {
      days = getMonthRange(cursor).days;
    } else {
      const y = cursor.getFullYear();
      const count = Math.round((new Date(y + 1, 0, 1).getTime() - new Date(y, 0, 1).getTime()) / 86_400_000);
      days = Array.from({ length: count }, (_, i) => {
        const d = new Date(y, 0, 1);
        d.setDate(d.getDate() + i);
        return d;
      });
    }

    const keys = new Set(days.map(toDayKey));
    return entries.filter((e) => keys.has(toDayKey(new Date(e.occurred_at))));
  });


  const rangeLabel = $derived.by(() => {
    if (rangeType === "week") {
      const { start, end } = getWeekRange(cursor);
      const fmt = (d: Date) =>
        d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
      return `${fmt(start)} — ${fmt(end)}`;
    }
    if (rangeType === "month") {
      return cursor.toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      });
    }
    return String(cursor.getFullYear());
  });

  const totalMins = $derived(
    rangeEntries.reduce((s: number, e) => s + e.duration_minutes, 0),
  );

  const catStats = $derived(
    CATS.map((cat) => {
      const catEntries = rangeEntries.filter((e) => e.category === cat);
      const mins = catEntries.reduce((s: number, e) => s + e.duration_minutes, 0);
      const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0;
      return { cat, mins, pct, sessions: catEntries.length };
    }),
  );

  const activeDays = $derived.by(() => {
    const keys = new Set(
      rangeEntries.map((e) => toDayKey(new Date(e.occurred_at))),
    );
    return keys.size;
  });

  function fmtMins(m: number) {
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60 > 0 ? (m % 60) + "m" : ""}`.trim();
  }
</script>

<div class="border border-border rounded bg-panel p-4">
  <div class="flex gap-1 p-0.5 bg-bg rounded mb-4">
    {#each ["week", "month", "year"] as r}
      <button
        onclick={() => { rangeType = r as 'week' | 'month' | 'year'; cursor = new Date(); }}
        class="
          flex-1 py-1.5 rounded text-xs font-mono transition-all duration-150
          {rangeType === r
          ? 'bg-panel text-text'
          : 'text-muted hover:text-muted2'}
        "
      >
        {r === "week" ? "Semana" : r === "month" ? "Mes" : "Año"}
      </button>
    {/each}
  </div>

  <div class="flex items-center justify-between mb-4">
    <button
      onclick={() => shift(-1)}
      class="text-muted hover:text-text text-lg px-1 transition-colors"
      >‹</button
    >
    <span class="text-xs font-mono text-muted2">{rangeLabel}</span>
    <button
      onclick={() => shift(1)}
      class="text-muted hover:text-text text-lg px-1 transition-colors"
      >›</button
    >
  </div>

  <div class="text-center mb-5">
    <span class="font-mono text-2xl font-bold text-text"
      >{fmtMins(totalMins)}</span
    >
    <span class="block text-[10px] font-mono text-muted mt-0.5"
      >tiempo total invertido</span
    >
    <span class="block text-[10px] font-mono text-muted">
      {activeDays} día{activeDays !== 1 ? "s" : ""} activo{activeDays !== 1
        ? "s"
        : ""}
    </span>
  </div>

  <div class="flex flex-col gap-3">
    {#each catStats as { cat, mins, pct, sessions }}
      <div>
        <div class="flex justify-between items-baseline mb-1">
          <span class="text-xs font-semibold" style="color: {COLORS[cat]}"
            >{LABELS[cat]}</span
          >
          <span class="text-[10.5px] font-mono text-muted2"
            >{fmtMins(mins)} · {sessions} sesión{sessions !== 1
              ? "es"
              : ""}</span
          >
        </div>

        <div class="h-[5px] rounded-full bg-seg-off overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            style="width: {pct}%; background: {COLORS[cat]}"
          ></div>
        </div>
        <span class="text-[9px] font-mono text-muted mt-0.5 block"
          >{pct}% del total</span
        >
      </div>
    {/each}
  </div>

  {#if totalMins === 0}
    <p class="text-muted text-xs font-mono text-center mt-4">
      Sin datos en este rango
    </p>
  {/if}
</div>
