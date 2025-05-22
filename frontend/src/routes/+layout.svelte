<script lang="ts">
    import '../app.css';
    import { page } from "$app/state";
    import { DarkMode, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from "flowbite-svelte";

    import { onMount } from 'svelte'
    import { invalidate } from '$app/navigation'

    let { data, children } = $props()

    let { session, supabase } = $derived(data)
    let activeUrl = $derived(page.url.pathname);

    onMount(() => {
        const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }
        })

        return () => data.subscription.unsubscribe()
    })
</script>

<svelte:head>
    <title>Puttable</title>
</svelte:head>

<Navbar>
    <NavBrand href="/">
        <img src="/favicon.png" class="me-3 h-9 sm:h-9" alt="Flowbite Logo"/>
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Puttable</span>
    </NavBrand>
    <NavHamburger/>
    <NavUl {activeUrl} >
        <NavLi href="/">Tournaments</NavLi>
        <NavLi href="/player">Player</NavLi>
        <NavLi href="/admin">Admin</NavLi>
    </NavUl>
    <DarkMode/>
</Navbar>
<div class="text-gray-900 dark:text-white text-base font-medium tracking-tight p-8">
    {@render children()}
</div>
