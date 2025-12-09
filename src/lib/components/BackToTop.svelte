<script>
  import { onMount } from 'svelte';

  let visible = false;

  function scrollTarget() {
    // Try to find the Table of Contents heading
    // You use:  ## Table of Contents
    const toc = document.querySelector('h2#table-of-contents, h2[id*="table-of-contents"]');

    if (toc) {
      toc.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  onMount(() => {
    const onScroll = () => {
      visible = window.scrollY > 300;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Initial state
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  });
</script>

{#if visible}
  <button class="back-to-top" on:click={scrollTarget} aria-label="Back to top">
    ↑ Top
  </button>
{/if}
