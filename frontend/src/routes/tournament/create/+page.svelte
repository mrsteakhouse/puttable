<script lang="ts">
    import TournamentForm from "$lib/TournamentForm.svelte";
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<TournamentForm formData={data.form}/>