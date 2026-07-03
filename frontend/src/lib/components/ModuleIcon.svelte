<script lang="ts">
  let {
    iconKey = "circle",
    class: className = "",
    size = 18,
  }: {
    iconKey: string;
    class?: string;
    size?: number;
  } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
  width={size}
  height={size}
  class={className}
>
  {#if iconKey === "dumbbell"}
    <line x1="6.5" y1="12" x2="17.5" y2="12" />
    <rect x="3" y="9.5" width="3.5" height="5" rx="1" />
    <rect x="17.5" y="9.5" width="3.5" height="5" rx="1" />
    <rect x="6" y="11" width="2" height="2" rx="0.5" />
    <rect x="16" y="11" width="2" height="2" rx="0.5" />
  {:else if iconKey === "vinyl"}
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" opacity="0.35" />
    <circle cx="12" cy="12" r="1.5" />
  {:else if iconKey === "video"}
    <rect x="2" y="7" width="13" height="10" rx="1.5" />
    <path d="M15 10.5 L21 7.5 L21 16.5 L15 13.5 Z" />
  {:else}
    <circle cx="12" cy="12" r="5" />
  {/if}
</svg>
