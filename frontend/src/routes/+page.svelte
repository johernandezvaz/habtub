<script lang="ts">
  import { onMount } from "svelte";
  import {
    entries,
    entriesLoading,
    entriesError,
    fetchRange,
    insertEntry,
  } from "$lib/stores/entries.js";
  import { signOut, session } from "$lib/stores/auth.js";
  import {
    toDayKey,
    isFutureDay,
    getWeekRange,
    getMonthRange,
    getYearMonthBuckets,
    bucketEntriesByDay,
  } from "$lib/utils/dates.js";
  import EntryList from "$lib/components/EntryList.svelte";
  import VuMeter from "$lib/components/VuMeter.svelte";
  import Heatmap from "$lib/components/Heatmap.svelte";
  import StatsPanel from "$lib/components/StatsPanel.svelte";

  let activeTab = $state("hoy");

  type Cat = "exercise" | "music" | "content";

  let sheetOpen = $state(false);
  let sheetCat = $state<Cat | null>(null);
  let logError = $state("");
  let logLoading = $state(false);

  // Extracted so sidebar and tab-bar share the same definition
  const TABS = [
    { id: "hoy", label: "Hoy", icon: "clock" },
    { id: "historial", label: "Historial", icon: "calendar" },
    { id: "stats", label: "Stats", icon: "chart" },
  ] as const;

  const streak = $derived.by(() => {
    const byDay = bucketEntriesByDay($entries);
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (!byDay.has(toDayKey(d))) break;
      count++;
    }
    return count;
  });

  const todayEntries = $derived(
    $entries.filter(
      (e) => toDayKey(new Date(e.occurred_at)) === toDayKey(new Date()),
    ),
  );

  const dateLabel = new Date()
    .toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();

  onMount(async () => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 366);
    await fetchRange(from, to);
  });

  function openSheet(cat: Cat) {
    sheetCat = cat;
    sheetOpen = true;
    logError = "";
  }

  function closeSheet() {
    sheetOpen = false;
    sheetCat = null;
    logError = "";
  }

  async function logEntry(duration_minutes: number) {
    if (!sheetCat) return;
    logLoading = true;
    logError = "";
    try {
      await insertEntry(sheetCat, duration_minutes);
      closeSheet();
    } catch (err) {
      logError = err instanceof Error ? err.message : "Error al guardar";
    } finally {
      logLoading = false;
    }
  }

  const CATS: Record<Cat, { label: string; color: string }> = {
    exercise: { label: "Ejercicio", color: "#3FE1D0" },
    music: { label: "Música", color: "#FF3EA5" },
    content: { label: "Contenido", color: "#F5A623" },
  };
</script>

<div class="bg-bg dt:max-w-[1040px] dt:mx-auto dt:min-h-screen dt:flex">
  <aside
    class="hidden dt:flex dt:flex-col dt:w-[220px] dt:shrink-0
           dt:border-r dt:border-border dt:sticky dt:top-0 dt:h-screen
           dt:px-[14px] dt:py-[22px]"
  >
    <div class="px-2.5 pb-5">
      <p class="font-mono text-[10px] tracking-[0.15em] text-muted">HABTUB</p>
      <p class="text-[18px] font-bold text-text tracking-tight mt-1">
        Bitácora
      </p>
    </div>

    <nav class="flex flex-col gap-1">
      {#each TABS as tab}
        <button
          id="sidebar-{tab.id}"
          onclick={() => (activeTab = tab.id)}
          class="
            flex items-center gap-3 px-3 py-[11px] rounded text-[13.5px]
            text-left transition-colors w-full
            {activeTab === tab.id
            ? 'bg-panel text-text border border-border'
            : 'text-muted2 hover:text-text'}
          "
        >
          {#if tab.icon === "clock"}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-[18px] h-[18px] shrink-0"
            >
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
            </svg>
          {:else if tab.icon === "calendar"}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-[18px] h-[18px] shrink-0"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" /><path
                d="M3 9h18M8 2v4M16 2v4"
              />
            </svg>
          {:else}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-[18px] h-[18px] shrink-0"
            >
              <path d="M4 20V10M12 20V4M20 20v-7" />
            </svg>
          {/if}
          {tab.label}
        </button>
      {/each}
    </nav>

    <div class="mt-auto border border-border rounded p-3">
      <span
        class="block font-mono text-[22px] font-bold
               bg-gradient-to-r from-music via-exercise to-content
               bg-clip-text text-transparent">{streak}</span
      >
      <span class="text-[9.5px] text-muted uppercase tracking-[0.06em]"
        >días seguidos</span
      >
    </div>

    <button
      onclick={signOut}
      class="flex items-center gap-3 px-3 py-[11px] rounded text-[13.5px]
             text-muted2 hover:text-text transition-colors text-left mt-1 w-full"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        class="w-[18px] h-[18px] shrink-0"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Cerrar sesión
    </button>
  </aside>

  <div
    class="max-w-[420px] mx-auto dt:max-w-none dt:flex-1 dt:min-w-0
           h-screen dt:h-auto dt:min-h-screen
           flex flex-col
           bg-bg border-x border-border dt:border-x-0
           relative"
  >
    <div
      class="dt:hidden flex items-center justify-between
             px-[18px] pt-[18px] pb-3 border-b border-border flex-shrink-0"
    >
      <div>
        <p class="font-mono text-[10px] tracking-[0.15em] text-muted">HABTUB</p>
        <p class="text-[17px] font-bold text-text tracking-tight mt-0.5">
          {dateLabel}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div
          class="flex items-baseline gap-1.5 border border-border rounded px-2.5 py-1.5"
        >
          <span
            class="font-mono text-base font-bold
                   bg-gradient-to-r from-music via-exercise to-content
                   bg-clip-text text-transparent">{streak}</span
          >
          <span class="text-[9px] text-muted uppercase tracking-[0.06em]"
            >días</span
          >
        </div>
        <button
          onclick={signOut}
          title="Cerrar sesión"
          class="text-muted hover:text-muted2 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            class="w-4 h-4"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>

    {#if $entriesError}
      <div
        class="bg-music/10 border-b border-music/30 px-4 py-2
               text-music text-xs text-center flex-shrink-0"
      >
        Error al cargar datos: {$entriesError}
      </div>
    {/if}

    <div class="flex-1 overflow-hidden dt:overflow-visible relative">
      {#if activeTab === "hoy"}
        <div
          class="h-full overflow-y-auto px-4 pt-4 pb-24 animate-screen-in
                 dt:h-auto dt:overflow-visible dt:px-8 dt:pt-7 dt:pb-10
                 dt:grid dt:grid-cols-[1.1fr_0.9fr] dt:gap-4 dt:items-start"
        >
          <div
            class="border border-border rounded bg-panel p-4 mb-3 dt:mb-0 dt:order-2"
          >
            <div class="flex justify-between items-center mb-3">
              <span class="font-mono text-[9.5px] tracking-[0.12em] text-muted"
                >CANAL · ESTA SEMANA</span
              >
            </div>
            <VuMeter entries={$entries} />
          </div>

          <div
            class="border border-border rounded bg-panel p-4 mb-3 dt:mb-0 dt:order-1"
          >
            <span
              class="font-mono text-[9.5px] tracking-[0.12em] text-muted block mb-3"
              >REGISTRAR AHORA</span
            >

            {#if $entriesLoading}
              <div
                class="flex gap-2 items-center justify-center py-6 text-muted text-xs font-mono"
              >
                <span class="animate-pulse">Cargando…</span>
              </div>
            {:else}
              <div class="flex flex-col gap-2.5">
                {#each Object.entries(CATS) as [cat, { label, color }]}
                  {@const todayEntry = todayEntries.find(
                    (e) => e.category === cat,
                  )}
                  <button
                    id="cat-btn-{cat}"
                    onclick={() => openSheet(cat as Cat)}
                    class="
                      flex items-center gap-3 border rounded p-4 cursor-pointer text-left
                      transition-all duration-150
                      {todayEntry
                      ? ''
                      : 'border-border bg-panel hover:border-muted/40'}
                    "
                    style={todayEntry
                      ? `border-color:${color}; background:color-mix(in srgb, ${color} 8%, #111418)`
                      : ""}
                  >
                    <span
                      class="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                      style={todayEntry
                        ? `background:${color}; box-shadow: 0 0 8px ${color}`
                        : "background:#2A2E33"}
                    ></span>
                    <span class="flex-1">
                      <span
                        class="block text-sm font-semibold"
                        style={todayEntry ? `color:${color}` : "color:#8A8F96"}
                        >{label}</span
                      >
                      <span
                        class="block text-[11px] font-mono text-muted mt-0.5"
                      >
                        {todayEntry
                          ? `registrado · ${todayEntry.duration_minutes} min`
                          : "sin registrar hoy"}
                      </span>
                    </span>
                    <span class="text-muted text-sm">›</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:else if activeTab === "historial"}
        <div
          class="h-full overflow-y-auto px-4 pt-4 pb-24 animate-screen-in
                 dt:h-auto dt:overflow-visible dt:px-8 dt:pt-7 dt:pb-10
                 dt:grid dt:grid-cols-[1.3fr_1fr] dt:gap-4 dt:items-start"
        >
          <div class="border border-border rounded bg-panel p-4 mb-3 dt:mb-0">
            <span
              class="font-mono text-[9.5px] tracking-[0.12em] text-muted block mb-3"
              >ÚLTIMAS 12 SEMANAS</span
            >
            {#if $entriesLoading}
              <div
                class="text-muted text-xs font-mono animate-pulse py-4 text-center"
              >
                Cargando…
              </div>
            {:else}
              <Heatmap entries={$entries} />
            {/if}
          </div>

          <div class="border border-border rounded bg-panel p-4">
            <span
              class="font-mono text-[9.5px] tracking-[0.12em] text-muted block mb-3"
              >HOY</span
            >
            {#if $entriesLoading}
              <div
                class="text-muted text-xs font-mono animate-pulse text-center py-4"
              >
                Cargando…
              </div>
            {:else if todayEntries.length === 0}
              <p class="text-muted text-xs font-mono text-center py-4">
                Sin registros hoy
              </p>
            {:else}
              <EntryList entries={todayEntries} />
            {/if}
          </div>
        </div>
      {:else if activeTab === "stats"}
        <div
          class="h-full overflow-y-auto px-4 pt-4 pb-24 animate-screen-in
                 dt:h-auto dt:overflow-visible dt:px-8 dt:pt-7 dt:pb-10"
        >
          {#if $entriesLoading}
            <div
              class="text-muted text-xs font-mono animate-pulse text-center py-10"
            >
              Cargando…
            </div>
          {:else}
            <StatsPanel entries={$entries} />
          {/if}
        </div>
      {/if}
    </div>
    <div
      class="dt:hidden flex border-t border-border bg-panel/80 backdrop-blur-sm flex-shrink-0"
    >
      {#each TABS as tab}
        <button
          id="tab-{tab.id}"
          onclick={() => (activeTab = tab.id)}
          class="
            flex-1 flex flex-col items-center gap-1 py-3
            text-[10px] font-mono tracking-wide transition-colors
            {activeTab === tab.id
            ? 'text-text'
            : 'text-muted hover:text-muted2'}
          "
        >
          {#if tab.icon === "clock"}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-5 h-5"
            >
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
            </svg>
          {:else if tab.icon === "calendar"}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-5 h-5"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" /><path
                d="M3 9h18M8 2v4M16 2v4"
              />
            </svg>
          {:else}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="w-5 h-5"
            >
              <path d="M4 20V10M12 20V4M20 20v-7" />
            </svg>
          {/if}
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  {#if sheetOpen}
    <div
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      class="fixed inset-0 bg-black/45 flex items-end z-50"
      onclick={(e) => {
        if (e.target === e.currentTarget) closeSheet();
      }}
      onkeydown={(e) => {
        if (e.key === "Escape") closeSheet();
      }}
    >
      <div
        class="w-full dt:max-w-[420px] dt:mx-auto
               bg-[rgba(24,27,32,0.6)] backdrop-blur-xl
               border-t border-white/8 rounded-t-[18px]
               px-[18px] pt-5 pb-7"
      >
        <p class="text-[13px] font-mono text-muted2 mb-3.5">
          Duración — <strong class="text-text"
            >{sheetCat ? CATS[sheetCat].label : ""}</strong
          >
        </p>

        <div class="grid grid-cols-3 gap-2 mb-2">
          {#each [15, 30, 45, 60, 90, 120] as mins}
            <button
              id="dur-{mins}"
              onclick={() => logEntry(mins)}
              disabled={logLoading}
              class="
                border border-white/8 rounded bg-white/[0.04] text-muted2
                py-3.5 font-mono text-[13px] cursor-pointer
                hover:bg-white/[0.09] active:scale-95
                disabled:opacity-40
                transition-all duration-100
              "
            >
              {mins} min
            </button>
          {/each}
        </div>

        {#if logError}
          <p class="text-music text-xs font-mono text-center mt-2">
            {logError}
          </p>
        {/if}

        {#if logLoading}
          <p
            class="text-muted text-xs font-mono text-center mt-2 animate-pulse"
          >
            Guardando…
          </p>
        {/if}
      </div>
    </div>
  {/if}
</div>
