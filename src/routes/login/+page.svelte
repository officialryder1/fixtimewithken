<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { getCurrentUser, updateCurrentUser } from '$lib/stores/auth.svelte';

	let email = '';
	let password = '';
	let error = '';
    let currentUser = getCurrentUser();

	async function handleLogin() {
		error = '';
		try {
			await pb.collection('users').authWithPassword(email, password);
			
			if (pb.authStore.isValid) {
                // Redirect based on user role
                updateCurrentUser();
                if (currentUser?.role === 'admin') {
                    goto('/appointments');
                } else if (currentUser?.role === 'front_desk') {
                    goto('/appointments');
                } else {
                    goto('/appointments');
                }
            } else {
                error = 'Authentication failed';
            }
		} catch (err) {
			error = 'Invalid credentials or server error';
			console.error(err);
		}
	}
</script>

<div class="min-h-screen bg-gray-100 flex items-center justify-center">
	<div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
		<h1 class="text-2xl font-bold text-center text-gray-700">Login</h1>

		{#if error}
			<div class="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
				{error}
			</div>
		{/if}

		<div class="space-y-4">
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
				<input
					type="email"
					bind:value={email}
					class="w-full px-4 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
					placeholder="Enter your email"
					required
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
				<input
					type="password"
					bind:value={password}
					class="w-full text-black px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
					placeholder="Enter your password"
					required
				/>
			</div>

			<button
				on:click|preventDefault={handleLogin}
				class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
			>
				Log in
			</button>
		</div>

		<p class="text-sm text-gray-600 text-center">
			Don't have an account? <a href="/register" class="text-blue-600 hover:underline">Sign up</a>
		</p>
	</div>
</div>
