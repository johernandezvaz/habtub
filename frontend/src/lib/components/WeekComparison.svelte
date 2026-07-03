<script lang="ts">
  import { getWeekRange, toDayKey } from "$lib/utils/dates.js";

  type Entry = {
    id: string;
    category: string;
    duration_minutes: number;
    occurred_at: string;
  };
  let { entries }: { entries: Entry[] } = $props();

  const CATS = ["exercise", "music", "content"] as const;
  const LABELS = {
    exercise: "Ejercicio",
    music: "Música",
    content: "Contenido",
  };
  const COLORS = { exercise: "#3FE1D0", music: "#FF3EA5", content: "#F5A623" };

  const weekData = $derived.by(() => {
    const now = new Date();
    const thisWeek = getWeekRange(now);

    const prevPivot = new Date(thisWeek.start);
    prevPivot.setDate(prevPivot.getDate() - 7);
    const prevWeek = getWeekRange(prevPivot);

    const thisKeys = new Set(thisWeek.days.map(toDayKey));
    const prevKeys = new Set(prevWeek.days.map(toDayKey));

    return CATS.map((cat) => {
      const thisMins = entries
        .filter(
          (e) =>
            e.category === cat &&
            thisKeys.has(toDayKey(new Date(e.occurred_at))),
        )
        .reduce((s, e) => s + e.duration_minutes, 0);

      const prevMins = entries
        .filter(
          (e) =>
            e.category === cat &&
            prevKeys.has(toDayKey(new Date(e.occurred_at))),
        )
        .reduce((s, e) => s + e.duration_minutes, 0);

      const maxMins = Math.max(thisMins, prevMins, 1);
      const delta =
        prevMins > 0
          ? Math.round(((thisMins - prevMins) / prevMins) * 100)
          : null;

      return { cat, thisMins, prevMins, maxMins, delta };
    });
  });

  function fmtMins(m: number): string {
    if (m === 0) return "0m";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  }
</script>

<div class="border border-border rounded bg-panel p-4">
  <span class="font-mono text-[9.5px] tracking-[0.12em] text-muted block mb-4">
    ESTA SEMANA VS. ANTERIOR
  </span>

  <div class="flex flex-col gap-4">
    {#each weekData as { cat, thisMins, prevMins, maxMins, delta } (cat)}
      {@const color = COLORS[cat]}
      <div>
        <div class="flex items-baseline justify-between mb-2">
          <span class="text-xs font-semibold" style="color:{color}"
            >{LABELS[cat]}</span
          >
          {#if delta !== null}
            <span
              class="font-mono text-[10px] font-bold"
              style="color:{delta >= 0 ? '#3FE1D0' : '#FF3EA5'}"
            >
              {delta >= 0 ? "+" : ""}{delta}%
            </span>
          {:else}
            <span class="font-mono text-[10px] text-muted">—</span>
          {/if}
        </div>

        <div class="flex items-center gap-2 mb-1">
          <span
            class="w-10 text-[9px] font-mono text-muted text-right shrink-0"
          >
            esta
          </span>
          <div class="flex-1 h-[5px] rounded-full bg-seg-off overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              style="width:{(thisMins / maxMins) * 100}%; background:{color}"
            ></div>
          </div>
          <span
            class="w-9 text-[9px] font-mono text-muted2 shrink-0 text-right"
          >
            {fmtMins(thisMins)}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="w-10 text-[9px] font-mono text-muted text-right shrink-0"
          >
            ant.
          </span>
          <div class="flex-1 h-[5px] rounded-full bg-seg-off overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 opacity-40"
              style="width:{(prevMins / maxMins) * 100}%; background:{color}"
            ></div>
          </div>
          <span
            class="w-9 text-[9px] font-mono text-muted2 shrink-0 text-right"
          >
            {fmtMins(prevMins)}
          </span>
        </div>
      </div>
    {/each}
  </div>
</div>
