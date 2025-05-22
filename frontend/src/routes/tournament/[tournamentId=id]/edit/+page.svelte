<script lang="ts">
    import TournamentForm from "$lib/TournamentForm.svelte";
    import type {PageProps} from './$types';

    let { data }: PageProps = $props();
    let tournament = $derived(data.tournament);

</script>

<TournamentForm tournamentData={tournament} isEdit={true}/>