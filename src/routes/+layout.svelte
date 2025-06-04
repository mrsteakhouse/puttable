<script lang="ts">
    import '../app.css';
    import { page } from "$app/state";
    import { DarkMode, Dropdown, DropdownItem, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from "flowbite-svelte";
    import { ChevronDownOutline, GlobeOutline } from 'flowbite-svelte-icons';

    import { onMount } from 'svelte'
    import { goto, invalidate } from '$app/navigation'
    import PermissionGuard from '$lib/components/PermissionGuard.svelte';
    import { Action, Resource } from '$lib/permissions';
    import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js';
    import { m } from "$lib/paraglide/messages";

    let { data, children } = $props()

    let { session, supabase, user } = $derived(data)
    let activeUrl = $derived(page.url.pathname);
    let userLoggedIn = $derived(user?.is_anonymous);
    // Use user_metadata.name from the session user
    let username = $derived(user?.user_metadata.name || session?.user?.email);
    let currentLocale = $state(getLocale());

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

    const changeLocale = (locale: any) => {
        setLocale(locale);
    }
</script>

<svelte:head>
    <title>{m.app_title()}</title>
    <meta name="description" content={m.app_description()} />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content={m.app_title()} />
    <meta property="og:description" content={m.app_description_short()} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://puttable.com" />
    <meta property="og:image" content="https://puttable.com/favicon.png" />
    <link rel="canonical" href="https://puttable.com{page.url.pathname}" />
</svelte:head>

<Navbar>
    <NavBrand href="/">
        <img src="/favicon.png" class="me-3 h-9 sm:h-9" alt={m.logo_alt()}/>
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">{m.brand_name()}</span>
    </NavBrand>
    <div class="flex items-center md:order-2">
        {#if !(userLoggedIn ?? true)}
            <NavHamburger/>
        {/if}
        <div class="flex items-center mr-2">
            <div class="cursor-pointer flex items-center text-primary-800 dark:text-white">
                <GlobeOutline class=" me-1 inline h-5 w-5"/>
                {currentLocale.toUpperCase()}
                <ChevronDownOutline class="ms-1 inline h-5 w-5"/>
            </div>
            <Dropdown simple>
                {#each locales as locale}
                    <DropdownItem onclick={() => changeLocale(locale)} class="cursor-pointer {locale === currentLocale ? 'font-bold' : ''}">
                        {#if locale === 'de'}
                            {m.language_german()}
                        {:else if locale === 'en'}
                            {m.language_english()}
                        {:else if locale === 'es'}
                            {m.language_spanish()}
                        {:else if locale === 'it'}
                            {m.language_italian()}
                        {:else if locale === 'fr'}
                            {m.language_french()}
                        {/if}
                    </DropdownItem>
                {/each}
            </Dropdown>
        </div>
        <DarkMode/>
    </div>

    {#if !(userLoggedIn ?? true)}
        <NavUl {activeUrl}>

            <PermissionGuard supabase={data.supabase} resource={Resource.Tournaments} action={Action.Read}>
                <NavLi href="/tournament">{m.nav_tournaments()}</NavLi>
            </PermissionGuard>
            <PermissionGuard supabase={data.supabase} resource={Resource.Players} action={Action.Read}>
                <NavLi href="/player">{m.nav_players()}</NavLi>
            </PermissionGuard>
            <PermissionGuard supabase={data.supabase} resource={Resource.Sessions} action={Action.Create}>
                <NavLi href="/session/create">{m.nav_free_game()}</NavLi>
            </PermissionGuard>
            <PermissionGuard supabase={data.supabase} resource={Resource.None} action={Action.None}>
                <NavLi href="/admin">{m.nav_admin()}</NavLi>
            </PermissionGuard>
            <NavLi class="cursor-pointer">
                    {username}
                <ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-white"/>
            </NavLi>
            <Dropdown simple>
                    <DropdownItem onclick={handleLogout}>{m.nav_logout()}</DropdownItem>
            </Dropdown>
        </NavUl>
    {/if}
</Navbar>
<div class="text-gray-900 dark:text-white text-base font-medium tracking-tight p-8">
    {@render children()}
</div>
