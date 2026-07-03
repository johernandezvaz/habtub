<script lang="ts">
  import { toDayKey, bucketEntriesByDay } from "$lib/utils/dates.js";

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

  function computeBestStreak(byDay: Map<string, unknown[]>): number {
    const keys = [...byDay.keys()].sort();
    if (keys.length === 0) return 0;
    let best = 1,
      run = 1;
    for (let i = 1; i < keys.length; i++) {
      const d1 = new Date(keys[i - 1] + "T12:00:00");
      const d2 = new Date(keys[i] + "T12:00:00");
      const diff = Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
      if (diff === 1) {
        run++;
        if (run > best) best = run;
      } else {
        run = 1;
      }
    }
    return best;
  }

  function computeCurrentStreak(byDay: Map<string, unknown[]>): number {
    const today = new Date();
    let count = 0;
    for (let i = 0; i < 366; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (!byDay.has(toDayKey(d))) break;
      count++;
    }
    return count;
  }

  const catData = $derived(
    CATS.map((cat) => {
      const byDay = bucketEntriesByDay(
        entries.filter((e) => e.category === cat),
      );
      const current = computeCurrentStreak(byDay);
      const best = Math.max(computeBestStreak(byDay), current);
      return { cat, current, best };
    }),
  );
</script>

<div class="border border-border rounded bg-panel p-4">
  <span class="font-mono text-[9.5px] tracking-[0.12em] text-muted block mb-4">
    RACHAS POR CATEGORÍA
  </span>

  <div class="flex flex-col gap-4">
    {#each catData as { cat, current, best } (cat)}
      {@const color = COLORS[cat]}
      {@const pct = best > 0 ? (current / best) * 100 : 0}
      <div>
        <div class="flex items-baseline justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <div
              class="w-2 h-2 rounded-full shrink-0"
              style="background:{color}"
            ></div>
            <span class="text-xs font-semibold" style="color:{color}"
              >{LABELS[cat]}</span
            >
          </div>
          <div class="text-right">
            <span class="font-mono text-sm font-bold text-text">{current}</span>
            <span class="font-mono text-[10px] text-muted"> / {best} días</span>
          </div>
        </div>
        <!-- Progress bar: actual / récord -->
        <div class="h-[4px] rounded-full bg-seg-off overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            style="width:{pct}%; background:{color}"
          ></div>
        </div>
      </div>
    {/each}
  </div>

  <p class="text-muted text-[10px] font-mono mt-3">
    racha actual / récord histórico
  </p>
</div>
