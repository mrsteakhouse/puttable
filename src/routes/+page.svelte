<script lang="ts">
    import { Button, Card } from "flowbite-svelte";
    import type { PageProps } from './$types'
    import { env } from '$env/dynamic/public';
    import { m } from "$lib/paraglide/messages"

    let { data }: PageProps = $props();

    const handleLogin = async () => {
        const { error } = await data.supabase.auth.signInWithOAuth({
            provider: 'keycloak',
            options: {
                scopes: 'openid',
                redirectTo: env.PUBLIC_SITE_BASE_URL + '/tournament'
            }
        });

        if (error) {
            console.error('Login error:', error);
        }
    }
</script>

<div class="max-w-md mx-auto px-4 py-16">
    <Card class="p-8" role="region" aria-labelledby="welcome-heading">
        <h1 id="welcome-heading" class="text-3xl font-bold text-center dark:text-white mb-8">{m.landing_page_header()}</h1>

        <p class="text-center mb-8 text-gray-700 dark:text-gray-300">
            {m.landing_page_text()}
        </p>

        <div class="flex justify-center">
            <Button
                    onclick={handleLogin}
                    size="lg"
                    class="w-full cursor-pointer"
                    aria-label="Bei Puttable anmelden"
            >
                {m.landing_page_login_button()}
            </Button>
        </div>
    </Card>
</div>
