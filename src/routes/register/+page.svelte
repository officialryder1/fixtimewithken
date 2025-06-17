<script>
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { redirect } from '@sveltejs/kit';

	let form = {
		name: '',
		email: '',
		password: '',
		passwordConfirm: '',
		company: '',
		phone: ''
	};

	let error = '';

	async function register() {
		try {
			const userData = {
				email: form.email,
				password: form.password,
				passwordConfirm: form.passwordConfirm,
				name: form.name,
				role: 'guest'
			};

			await pb.collection('users').create(userData);
			// await pb.collection('users').authRefresh();
			await pb.collection('users').authWithPassword(form.email, form.password);

			await pb.collection('visitors').create({
				user_id: pb.authStore.model.id,
				company: form.company,
				phone: form.phone
			});

			goto('/appointments')
		} catch (err) {
			error = err.message;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
	<div class="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
		<h1 class="text-2xl font-bold text-center mb-6 text-blue-400">Register as Visitor</h1>

		<form on:submit|preventDefault={register} class="space-y-4">
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
				<input type="text" id="name" bind:value={form.name} required
					class="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
				<input type="email" id="email" bind:value={form.email} required
					class="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
				<input type="password" id="password" bind:value={form.password} required
					class="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
			</div>

			<div>
				<label for="passwordConfirm" class="block text-sm font-medium text-gray-700">Confirm Password</label>
				<input type="password" id="passwordConfirm" bind:value={form.passwordConfirm} required
					class="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
			</div>

			<div>
				<label for="company" class="block text-sm font-medium text-gray-700">Company</label>
				<input type="text" id="company" bind:value={form.company}
					class="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
			</div>

			<div>
				<label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
				<input type="tel" id="phone" bind:value={form.phone}
					class="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
			</div>

			{#if error}
				<p class="text-red-500 text-sm mt-2">{error}</p>
			{/if}

			<div class="flex flex-col gap-2 mt-6">
				<button type="submit"
					class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition">
					Register
				</button>

				<a href="/login"
					class="text-sm text-center text-blue-600 hover:underline hover:text-blue-800">
					Already have an account? Login
				</a>
			</div>
		</form>
	</div>
</div>
