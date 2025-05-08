<script lang="ts">
    import '../app.css';
    import {page} from "$app/state";
    import {Navbar, NavBrand, NavLi, NavUl, NavHamburger, DarkMode} from "flowbite-svelte";
    import {base} from "$app/paths";


    let {children} = $props();
    let activeUrl = $derived(page.url.pathname);
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
