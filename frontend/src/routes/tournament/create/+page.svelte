<script lang="ts">
    import TournamentForm from "$lib/components/TournamentForm.svelte";
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<TournamentForm formData={data.form} ratingClasses={data.ratingClasses} tournamentId={0}/>