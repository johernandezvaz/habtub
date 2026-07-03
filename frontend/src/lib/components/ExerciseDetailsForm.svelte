<script lang="ts">
  let { color = "#3FE1D0", metadata = $bindable<Record<string, unknown>>({}) } =
    $props();

  let warmedUp = $state(false);
  let didCardio = $state(false);
  let muscleGroups = $state<string[]>([]);

  const MUSCLES = [
    { id: "leg", label: "Pierna" },
    { id: "abdomen", label: "Abdomen" },
    { id: "shoulder", label: "Hombro" },
    { id: "bicep", label: "Bícep" },
    { id: "back", label: "Espalda" },
    { id: "tricep", label: "Trícep" },
    { id: "chest", label: "Pecho" },
  ];

  function toggleMuscle(id: string) {
    muscleGroups = muscleGroups.includes(id)
      ? muscleGroups.filter((g) => g !== id)
      : [...muscleGroups, id];
  }

  $effect(() => {
    metadata = {
      warmed_up: warmedUp,
      did_cardio: didCardio,
      muscle_groups: [...muscleGroups],
    };
  });
</script>

<div class="flex flex-col gap-4 pt-3 border-t border-white/8 mt-2">
  <div class="flex gap-2">
    <button
      type="button"
      onclick={() => (warmedUp = !warmedUp)}
      class="flex-1 flex items-center gap-2 rounded border py-2.5 px-3 text-left
             text-[11px] font-mono transition-all duration-150"
      style="
        border-color: {warmedUp ? color : 'rgba(255,255,255,0.08)'};
        background:   {warmedUp
        ? `color-mix(in srgb, ${color} 10%, transparent)`
        : 'transparent'};
        color:        {warmedUp ? color : '#5A5F66'};
      "
    >
      <span
        class="w-2 h-2 rounded-full shrink-0 transition-all"
        style="background:{warmedUp ? color : '#2A2F37'};
               {warmedUp ? `box-shadow:0 0 6px ${color}` : ''}"
      ></span>
      Calenté
    </button>

    <button
      type="button"
      onclick={() => (didCardio = !didCardio)}
      class="flex-1 flex items-center gap-2 rounded border py-2.5 px-3 text-left
             text-[11px] font-mono transition-all duration-150"
      style="
        border-color: {didCardio ? color : 'rgba(255,255,255,0.08)'};
        background:   {didCardio
        ? `color-mix(in srgb, ${color} 10%, transparent)`
        : 'transparent'};
        color:        {didCardio ? color : '#5A5F66'};
      "
    >
      <span
        class="w-2 h-2 rounded-full shrink-0 transition-all"
        style="background:{didCardio ? color : '#2A2F37'};
               {didCardio ? `box-shadow:0 0 6px ${color}` : ''}"
      ></span>
      Hice cardio
    </button>
  </div>
  <div>
    <p
      class="text-[9.5px] font-mono tracking-[0.1em] mb-2"
      style="color:{color}"
    >
      GRUPOS MUSCULARES
    </p>
    <div class="flex flex-wrap gap-1.5">
      {#each MUSCLES as { id, label }}
        {@const active = muscleGroups.includes(id)}
        <button
          type="button"
          onclick={() => toggleMuscle(id)}
          class="rounded border px-2.5 py-1 text-[10.5px] font-mono transition-all duration-100"
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
