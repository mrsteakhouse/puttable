<script lang="ts">
    import { Button, Card } from "flowbite-svelte";
    import type { PageProps } from './$types'
    import { env } from '$env/dynamic/public';

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
    <Card class="p-8">
        <h1 class="text-3xl font-bold text-center dark:text-white mb-8">Willkommen bei Puttable</h1>

        <p class="text-center mb-8 text-gray-700 dark:text-gray-300">
            Bitte melden Sie sich an, um auf die Turniere und Funktionen zuzugreifen.
        </p>

        <div class="flex justify-center">
            <Button
                    onclick={handleLogin}
                    size="lg"
                    class="w-full cursor-pointer"
            >
                Anmelden
            </Button>
        </div>
    </Card>
</div>
