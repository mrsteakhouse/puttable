<script lang="ts">
    import TournamentForm from "$lib/TournamentForm.svelte";
    import {onMount} from "svelte";
    import {supabase} from "$lib/supabase";
    import {fail} from "@sveltejs/kit";
    import {TournamentDto} from "$lib/dto";
    import moment from "moment/moment";
    import {page} from "$app/state";

    const tournamentId = Number(page.params.tournamentId);
    let tournament = $state({});

    onMount(async () => {
        const {data, error} = await supabase
            .from('tournaments')
            .select()
            .eq('id', tournamentId)
            .single();

        if (error && !data) {
            fail(500, {message: error.message})
            return;
        }

        tournament = new TournamentDto(
            data.id,
            data.name,
            moment(data.start_date),
            moment(data.end_date),
            data.number_of_holes,
            data.minimum_participants,
            data.description ?? ''
        );
    });
</script>

<TournamentForm tournamentData={tournament} isEdit={true}/>