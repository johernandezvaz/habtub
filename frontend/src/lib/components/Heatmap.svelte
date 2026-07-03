<script lang="ts">
  /**
   * Heatmap — grid de 12 semanas × 7 días.
   * Cada celda muestra la actividad del día coloreada por categorías presentes.
   * El agrupamiento usa toDayKey (timezone local) — ver dates.js.
   */
  import {
    bucketEntriesByDay,
    toDayKey,
    isFutureDay,
  } from "$lib/utils/dates.js";

  let { entries } = $props();

  const COLORS: Record<string, string> = { exercise: '#3FE1D0', music: '#FF3EA5', content: '#F5A623' };
  const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

  const grid = $derived.by(() => {
    const byDay = bucketEntriesByDay(entries);
    const today = new Date();

    const todayDow = (today.getDay() + 6) % 7;
    const monday12WeeksAgo = new Date(today);
    monday12WeeksAgo.setDate(today.getDate() - todayDow - 11 * 7);
    monday12WeeksAgo.setHours(0, 0, 0, 0);

    const cols = [];
    for (let col = 0; col < 12; col++) {
      const days = [];
      for (let row = 0; row < 7; row++) {
        const d = new Date(monday12WeeksAgo);
        d.setDate(monday12WeeksAgo.getDate() + col * 7 + row);
        const key = toDayKey(d);
        const dayEntries = byDay.get(key) ?? [];

        let bg = "#1A1D21";
        if (!isFutureDay(d) && dayEntries.length > 0) {
          const cats = [...new Set(dayEntries.map((e) => e.category))];
          if (cats.length === 1) bg = COLORS[cats[0]];
          else bg = "#EDEAE4";
        }

        days.push({
          date: d,
          key,
          count: dayEntries.length,
          bg,
          isFuture: isFutureDay(d),
        });
      }
      cols.push(days);
    }
    return cols;
  });
</script>

<div class="flex gap-1 overflow-x-auto pb-1">
  <div class="flex flex-col gap-[3px] mr-0.5 shrink-0 pt-[18px]">
    {#each DAY_LABELS as label}
      <span class="w-3 h-3 flex items-center text-[8px] text-muted"
        >{label}</span
      >
    {/each}
  </div>

  {#each grid as col}
    <div class="flex flex-col gap-[3px] shrink-0">
      {#each col as day}
        <div
          title="{day.key} — {day.count} entrada{day.count !== 1 ? 's' : ''}"
          class="w-3 h-3 rounded-[3px] cursor-pointer transition-opacity {day.isFuture
            ? 'opacity-30'
            : 'hover:opacity-80'}"
          style="background: {day.bg}"
        ></div>
      {/each}
    </div>
  {/each}
</div>
