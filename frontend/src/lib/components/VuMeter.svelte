<script lang="ts">
  import {
    getWeekRange,
    toDayKey,
    bucketEntriesByDay,
  } from "$lib/utils/dates.js";

  let { entries } = $props();

  const CATS = ["exercise", "music", "content"] as const;
  type Cat = (typeof CATS)[number];
  const COLORS: Record<Cat, string> = {
    exercise: "#3FE1D0",
    music: "#FF3EA5",
    content: "#F5A623",
  };
  const SEG_COUNT = 8;

  const weekData = $derived.by(() => {
    const { days } = getWeekRange(new Date());
    const byDay = bucketEntriesByDay(entries);

    return CATS.map((cat) => {
      let totalMins = 0;
      for (const day of days) {
        const dayEntries = byDay.get(toDayKey(day)) ?? [];
        totalMins += dayEntries
          .filter(
            (e: { category: string; duration_minutes: number }) =>
              e.category === cat,
          )
          .reduce(
            (s: number, e: { duration_minutes: number }) =>
              s + e.duration_minutes,
            0,
          );
      }

      const level = Math.min(totalMins / 300, 1);
      return { cat, totalMins, level };
    });
  });
</script>

<div class="flex gap-2.5 items-end h-16 mb-1">
  {#each weekData as { cat, level, totalMins }}
    <div class="flex-1 flex flex-col justify-end gap-0.5 h-full">
      {#each Array.from({ length: SEG_COUNT }, (_, i) => i) as i}
        {@const threshold = (SEG_COUNT - 1 - i) / SEG_COUNT}
        {@const lit = level > threshold}
        <div
          class="h-[6px] rounded-[2px] origin-left {lit
            ? 'animate-seg-fill'
            : ''}"
          style="
            background: {lit ? COLORS[cat] : '#1A1D21'};
            transform: scaleX({lit ? 1 : 0});
            transition: background 0.2s;
            animation-delay: {lit ? i * 30 : 0}ms;
          "
        ></div>
      {/each}
    </div>
  {/each}
</div>

<div class="flex gap-2.5 mt-2">
  {#each weekData as { cat, totalMins }}
    <div class="flex-1 text-center">
      <span class="text-[9.5px] font-mono text-muted2">
        {totalMins > 0 ? `${totalMins}m` : "—"}
      </span>
    </div>
  {/each}
</div>
<div class="flex gap-2.5 mt-0.5">
  {#each ["EJERCICIO", "MÚSICA", "CONTENIDO"] as label}
    <span class="flex-1 text-center text-[8.5px] font-mono text-muted"
      >{label}</span
    >
  {/each}
</div>
