<script lang="ts">
  let { color = "#FF3EA5", metadata = $bindable<Record<string, unknown>>({}) } =
    $props();

  let genre = $state("");
  let phase = $state<"production" | "mixing" | "mastering" | "">("");

  const PHASES: { id: "production" | "mixing" | "mastering"; label: string }[] =
    [
      { id: "production", label: "Producción" },
      { id: "mixing", label: "Mezcla" },
      { id: "mastering", label: "Master" },
    ];

  $effect(() => {
    metadata = {
      ...(genre.trim() && { genre: genre.trim() }),
      ...(phase && { phase }),
    };
  });
</script>

<div class="flex flex-col gap-4 pt-3 border-t border-white/8 mt-2">
  <div>
    <p
      class="text-[9.5px] font-mono tracking-[0.1em] mb-1.5"
      style="color:{color}"
    >
      GÉNERO
    </p>
    <input
      type="text"
      bind:value={genre}
      placeholder="ej. house, jazz, ambient…"
      class="w-full bg-transparent text-sm font-mono text-text placeholder:text-muted
             border-b border-white/8 pb-1.5 focus:outline-none transition-colors"
      style="border-bottom-color: {genre ? color : 'rgba(255,255,255,0.08)'};"
    />
  </div>

  <div>
    <p
      class="text-[9.5px] font-mono tracking-[0.1em] mb-1.5"
      style="color:{color}"
    >
      FASE
    </p>
    <div class="flex gap-1.5">
      {#each PHASES as { id, label }}
        {@const active = phase === id}
        <button
          type="button"
          onclick={() => (phase = active ? "" : id)}
          class="flex-1 rounded border py-2 text-[11px] font-mono transition-all duration-100"
          style="
            border-color: {active ? color : 'rgba(255,255,255,0.08)'};
            background:   {active
            ? `color-mix(in srgb, ${color} 12%, transparent)`
            : 'transparent'};
            color:        {active ? color : '#5A5F66'};
          "
        >
          {label}
        </button>
      {/each}
    </div>
  </div>
</div>
