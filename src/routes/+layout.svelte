<script lang="ts">
    import '../app.css';
    import { page } from "$app/state";
    import { DarkMode, Dropdown, DropdownItem, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from "flowbite-svelte";
    import { ChevronDownOutline } from 'flowbite-svelte-icons';

    import { onMount } from 'svelte'
    import { goto, invalidate } from '$app/navigation'
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';

    let { data, children } = $props()

    let { session, supabase, user } = $derived(data)
    let activeUrl = $derived(page.url.pathname);
    let userLoggedIn = $derived(user?.is_anonymous);
    // Use user_metadata.name from the session user
    let username = $derived(user?.user_metadata.name || session?.user?.email);

    onMount(() => {
        const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }
        })

        return () => data.subscription.unsubscribe()
    })

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await goto('/', { invalidateAll: true });
    }
</script>

<svelte:head>
    <title>Puttable - Mini Golf Score Tracking</title>
    <meta name="description" content="Track and manage mini golf tournaments, players, and scores with Puttable - the ultimate mini golf scoring platform." />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Puttable - Mini Golf Score Tracking" />
    <meta property="og:description" content="Track and manage mini golf tournaments, players, and scores with Puttable." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://puttable.com" />
    <meta property="og:image" content="https://puttable.com/favicon.png" />
    <link rel="canonical" href="https://puttable.com{page.url.pathname}" />
</svelte:head>

<Navbar>
    <NavBrand href="/">
        <img src="/favicon.png" class="me-3 h-9 sm:h-9" alt="Flowbite Logo"/>
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Puttable</span>
    </NavBrand>
    <div class="flex items-center md:order-2">
        {#if !(userLoggedIn ?? true)}
            <NavHamburger/>
        {/if}
        <DarkMode/>
    </div>

    {#if !(userLoggedIn ?? true)}
        <NavUl {activeUrl}>

            <PermissionGuard supabase={data.supabase} resource={Resource.Tournaments} action={Action.Read}>
                <NavLi href="/tournament">Turniere</NavLi>
            </PermissionGuard>
            <PermissionGuard supabase={data.supabase} resource={Resource.Players} action={Action.Read}>
                <NavLi href="/player">Spieler</NavLi>
            </PermissionGuard>
            <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Create}>
                <NavLi href="/session/create">Freies Spiel</NavLi>
            </PermissionGuard>
            <PermissionGuard supabase={data.supabase} resource={Resource.None} action={Action.None}>
                <NavLi href="/admin">Admin</NavLi>
            </PermissionGuard>
            <NavLi class="cursor-pointer">
                    {username}
                <ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-white"/>
            </NavLi>
            <Dropdown simple>
                    <DropdownItem onclick={handleLogout}>Logout</DropdownItem>
            </Dropdown>
        </NavUl>
    {/if}
</Navbar>
<div class="text-gray-900 dark:text-white text-base font-medium tracking-tight p-8">
    {@render children()}
</div>
