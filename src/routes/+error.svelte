<script>
    import { page } from '$app/state';
    import * as Sentry from "@sentry/sveltekit";

    Sentry.captureMessage(page.error?.message ?? 'unexpected error');
</script>

<div class="error-container">
    <div class="error-content">
        <h1 class="error-title">Error {page.status}</h1>
        <p class="error-message">{page.error?.message || 'An unexpected error occurred'}</p>
        <div class="error-actions">
            <button class="btn btn-secondary" on:click={() => history.back()}>Go Back</button>
            <a href="/" class="btn btn-primary">Go to Home</a>
        </div>
    </div>
</div>

<style>
    .error-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding: 2rem;
    }

    .error-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        text-align: center;
    }

    .error-title {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: #e53e3e;
    }

    .error-message {
        margin-bottom: 2rem;
        color: #4a5568;
    }

    .error-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
    }

    .btn-primary {
        background-color: #3182ce;
        color: white;
        border: none;
    }

    .btn-secondary {
        background-color: #e2e8f0;
        color: #4a5568;
        border: none;
    }
</style>
