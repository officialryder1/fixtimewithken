<script>
  import { pb } from '$lib/pocketbase';
  import { getCurrentUser } from '$lib/stores/auth.svelte';
  import { deleteCookie } from '$lib/cookieUtils';
  import { onMount, onDestroy } from 'svelte';


  export let appointments = [];
  
  let currentUser = getCurrentUser();
  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'requested', label: 'Requested' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  let selectedStatus = '';
  let selectedDate = '';
  let unsubscribe = null;

  // Filter logic for different user types
  $: filteredAppointments = appointments.filter(appt => {
    const statusMatch = !selectedStatus || appt.status === selectedStatus;
    const dateMatch = !selectedDate || new Date(appt.requested_date).toISOString().split('T')[0] === selectedDate;
    
    // For guest users, only show their own appointments
    if (currentUser?.role === 'guest') {
      return statusMatch && dateMatch && appt.visitor_email === currentUser.email;
    }
    
    // For admin/front desk, show all appointments
    return statusMatch && dateMatch;
  });

  onMount(async () => {
	// Subscribe to realtime updates
    unsubscribe = pb.collection('appointments').subscribe('*', async (e) => {
      console.log('Realtime update:', e);
      
      // Handle different event types
      if (e.action === 'create') {
        appointments = [...appointments, e.record];
      } 
      else if (e.action === 'update') {
        appointments = appointments.map(appt => 
          appt.id === e.record.id ? e.record : appt
        );
      }
      else if (e.action === 'delete') {
        appointments = appointments.filter(appt => appt.id !== e.record.id);
      }
    });
  })

  // Clean up subscription
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusColor(status) {
    switch(status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-error';
      case 'cancelled': return 'badge-warning';
      default: return 'badge-info';
    }
  }

  async function cancelAppointment(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await pb.collection('appointments').update(id, { status: 'cancelled' });
        // appointments = appointments.map(appt =>
        //   appt.id === id ? { ...appt, status: 'cancelled' } : appt
        // );
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  }

  async function handleLogout() {
    try {
      await pb.authStore.clear();
      deleteCookie('pb_auth');
      window.location.href = '/login';
    } catch (err) {
      alert('Error logging out: ' + err.message);
    }
  }

  async function approveAppointment(id) {
    try {
      await pb.collection('appointments').update(id, {status: 'approved', approved_by: currentUser.id});
      
    } catch(err) {
      alert('Error: ' + err.message);
    }
  }

  async function rejectAppointment(id) {
    try {
      await pb.collection('appointments').update(id, {status: 'rejected', approved_by: currentUser.id});
      
    } catch(err) {
      alert('Error: ' + err.message);
    }
  }
</script>

<div class="p-4 md:p-6 lg:p-8 w-full space-y-6 bg-base-100 min-h-screen">
  <!-- Header Section -->
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-primary">
        {#if currentUser?.role === 'guest'}
          My Appointments
        {:else}
          Appointments
        {/if}
      </h1>
      <p class="text-sm text-gray-500">
        Showing {filteredAppointments.length} appointment{#if filteredAppointments.length !== 1}s{/if}
        {#if currentUser?.role === 'guest'}
          for your account
        {/if}
      </p>
    </div>

    <!-- Auth Section -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {#if !currentUser}
        <div class="flex flex-col sm:flex-row gap-2">
          <a href="/login" class="btn btn-primary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </a>
          <a href="/register" class="btn btn-secondary btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Register
          </a>
        </div>
      {:else}
        <div class="flex items-center gap-2">
          <div class="avatar placeholder">
            <div class="bg-neutral-focus text-neutral-content rounded-full w-8">
              <span>{currentUser.name?.charAt(0) || 'U'}</span>
            </div>
          </div>
          <span class="font-medium">Hi, {currentUser.name || 'User'}!</span>
          <button on:click={handleLogout} class="btn btn-error btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Filters -->
  <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-base-200 p-4 rounded-box shadow-sm">
    {#if currentUser?.role === 'admin' || currentUser?.role === 'front_desk'}
      <select 
        bind:value={selectedStatus} 
        class="select select-bordered select-sm w-full sm:w-auto"
      >
        {#each statusOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    {/if}
    
    <input 
      type="date" 
      bind:value={selectedDate} 
      class="input input-bordered input-sm w-full sm:w-auto"
    />
    
    <button 
      on:click={() => {
        selectedStatus = '';
        selectedDate = '';
      }}
      class="btn btn-ghost btn-sm"
    >
      Clear Filters
    </button>
  </div>

  <!-- Appointments Table -->
  <div class="overflow-x-auto bg-base-100 rounded-box shadow-lg border border-base-200">
    {#if filteredAppointments.length > 0}
      <table class="table table-zebra">
        <thead>
          <tr class="bg-base-200">
            <th>Date</th>
            <th>Time</th>
            {#if currentUser?.role !== 'guest'}
              <th>Visitor</th>
            {/if}
            <th>Purpose</th>
            <th>Duration</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredAppointments as appt}
            <tr class="hover">
              <td>{formatDate(appt.requested_date)}</td>
              <td>{formatTime(appt.requested_date)}</td>
              {#if currentUser?.role !== 'guest'}
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar placeholder">
                      <div class="bg-neutral-focus text-neutral-content rounded-full w-6">
                        <span class="text-xs">{appt.visitor_name?.charAt(0) || '?'}</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-medium">{appt.visitor_name ?? 'Unknown'}</div>
                      {#if appt.visitor_email}
                        <div class="text-xs text-gray-500">{appt.visitor_email}</div>
                      {/if}
                    </div>
                  </div>
                </td>
              {/if}
              {#if currentUser?.role === 'front_desk'}
				<td class="max-w-xs truncate">*****</td>
			  {:else}
				<td class="max-w-xs truncate">{appt.purpose}</td>
			  {/if}
              <td>{appt.duration} mins</td>
              <td>
                <span class="badge {getStatusColor(appt.status)} gap-2 capitalize">
                  {appt.status}
                </span>
              </td>
              <td class="text-right">
                <div class="flex gap-1 justify-end">
                  {#if currentUser?.role === 'admin'}
                    {#if appt.status === 'requested'}
                      <button 
                        on:click={() => approveAppointment(appt.id)} 
                        class="btn btn-success btn-xs"
                      >
                        Approve
                      </button>
                      <button 
                        on:click={() => rejectAppointment(appt.id)} 
                        class="btn btn-error btn-xs"
                      >
                        Reject
                      </button>
                    {:else if appt.status === 'approved'}
                      <button 
                        on:click={() => rejectAppointment(appt.id)} 
                        class="btn btn-warning btn-xs"
                      >
                        Cancel
                      </button>
                    {:else if appt.status === 'rejected'}
                      <button 
                        on:click={() => approveAppointment(appt.id)} 
                        class="btn btn-success btn-xs"
                      >
                        Approve
                      </button>
                    {/if}
                  {:else if currentUser?.role === 'guest'}
                    {#if appt.status === 'requested' || appt.status === 'approved'}
                      <button 
                        on:click={() => cancelAppointment(appt.id)} 
                        class="btn btn-warning btn-xs"
                      >
                        Cancel
                      </button>
                    {/if}
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium">No appointments found</h3>
        <p class="mt-1 text-gray-500">
          {#if selectedStatus || selectedDate}
            Try adjusting your filters
          {:else}
            {#if currentUser?.role === 'guest'}
              <a href="/book" class="link link-primary">Book your first appointment</a>
            {:else}
              No appointments have been created yet
            {/if}
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>