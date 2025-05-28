<script lang="ts">
    import '../app.css';
    import { page } from "$app/state";
    import { DarkMode, Dropdown, DropdownItem, Navbar, NavBrand, NavHamburger, NavLi, NavUl } from "flowbite-svelte";
    import { ChevronDownOutline } from 'flowbite-svelte-icons';
    import { PUBLIC_SITE_BASE_URL } from '$env/static/public';

    import { onMount } from 'svelte'
    import { goto, invalidate } from '$app/navigation'

    let { data, children } = $props()

    let { session, supabase, user } = $derived(data)
    let activeUrl = $derived(page.url.pathname);
    let userLoggedIn = $derived(user?.is_anonymous);
    let username = $derived(user?.user_metadata.name);

    onMount(() => {
        const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }
        })

        return () => data.subscription.unsubscribe()
    })

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'keycloak',
            options: {
                scopes: 'openid',
                redirectTo: PUBLIC_SITE_BASE_URL
            }
        });

        if (error) {
            await goto('/auth/error')
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();
    }
</script>

<svelte:head>
    <title>Puttable</title>
</svelte:head>

<Navbar>
    <NavBrand href="/">
        <img src="/favicon.png" class="me-3 h-9 sm:h-9" alt="Flowbite Logo"/>
        <span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Puttable</span>
    </NavBrand>
    <div class="flex items-center md:order-2">
        <NavHamburger/>
        <DarkMode/>
    </div>
    <NavUl {activeUrl} >
        <NavLi href="/">Turniere</NavLi>
        <NavLi href="/player">Spieler</NavLi>
        <NavLi class="cursor-pointer">
            {#if userLoggedIn ?? true}
                Log In
            {:else}
                {username}
            {/if}
            <ChevronDownOutline class="text-primary-800 ms-2 inline h-6 w-6 dark:text-white"/>
        </NavLi>
        <Dropdown simple>
            {#if userLoggedIn ?? true}
                <DropdownItem onclick={handleLogin}>Mit SSO einloggen</DropdownItem>
            {:else}
                <DropdownItem onclick={handleLogout}>Logout</DropdownItem>
            {/if}
        </Dropdown>
    </NavUl>
</Navbar>
<div class="text-gray-900 dark:text-white text-base font-medium tracking-tight p-8">
    {@render children()}
</div>
