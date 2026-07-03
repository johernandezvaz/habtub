<script lang="ts">
  let { color = "#F5A623", metadata = $bindable<Record<string, unknown>>({}) } =
    $props();

  let socialNetwork = $state("");
  let contentType = $state("");

  const SOCIAL_NETWORKS = [
    "Instagram",
    "YouTube",
    "TikTok",
    "X",
    "LinkedIn",
    "Twitch",
    "Otro",
  ];

  $effect(() => {
    metadata = {
      ...(socialNetwork && { social_network: socialNetwork }),
      ...(contentType.trim() && { content_type: contentType.trim() }),
    };
  });
</script>

<div class="flex flex-col gap-4 pt-3 border-t border-white/8 mt-2">
  <div>
    <p
      class="text-[9.5px] font-mono tracking-[0.1em] mb-1.5"
      style="color:{color}"
    >
      RED SOCIAL
    </p>
    <div class="flex flex-wrap gap-1.5">
      {#each SOCIAL_NETWORKS as net}
        {@const active = socialNetwork === net}
        <button
          type="button"
          onclick={() => (socialNetwork = active ? "" : net)}
          class="rounded border px-2.5 py-1 text-[10.5px] font-mono transition-all duration-100"
          style="
            border-color: {active ? color : 'rgba(255,255,255,0.08)'};
            background:   {active
            ? `color-mix(in srgb, ${color} 12%, transparent)`
            : 'transparent'};
            color:        {active ? color : '#5A5F66'};
          "
        >
          {net}
        </button>
      {/each}
    </div>
  </div>

  <div>
    <p
      class="text-[9.5px] font-mono tracking-[0.1em] mb-1.5"
      style="color:{color}"
    >
      TIPO DE CONTENIDO
    </p>
    <input
      type="text"
      bind:value={contentType}
      placeholder="ej. reel, carrusel, podcast…"
      class="w-full bg-transparent text-sm font-mono text-text placeholder:text-muted
             border-b border-white/8 pb-1.5 focus:outline-none transition-colors"
      style="border-bottom-color: {contentType
        ? color
        : 'rgba(255,255,255,0.08)'};"
    />
  </div>
</div>
