<script>
    import { pb } from "$lib/pocketbase";
    import { getCurrentUser } from "$lib/stores/auth.svelte";
    import AppointmentList from "$lib/components/AppointmentList.svelte";
    import { onMount, onDestroy } from "svelte";

    let appointments = [];
    let currentUser = getCurrentUser();
    let unsubscribe = null;

    onMount(async () => {
        await loadInitialAppointments();
        
        unsubscribe = pb.collection('appointments').subscribe('*', async (e) => {
            console.log('Realtime event:', e);
            
            if (e.action === 'create') {
                if (shouldIncludeAppointment(e.record)) {
                    appointments = [...appointments, e.record];
                }
            } 
            else if (e.action === 'update') {
                // Handle status changes
                if (e.record.status === 'rejected' && currentUser?.role === 'admin') {
                    // Immediately remove rejected appointments from admin view
                    appointments = appointments.filter(appt => appt.id !== e.record.id);
                } else {
                    // Standard update handling
                    appointments = appointments.filter(appt => appt.id !== e.record.id);
                    if (shouldIncludeAppointment(e.record)) {
                        appointments = [...appointments, e.record].sort((a, b) => 
                            new Date(b.created) - new Date(a.created))
                    }
                }
            }
            else if (e.action === 'delete') {
                appointments = appointments.filter(appt => appt.id !== e.record.id);
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    async function loadInitialAppointments() {
        try {
            if (currentUser?.role === 'admin') {
                await loadAllAppointments();
            } else if (currentUser?.role === 'front_desk') {
                await loadApprovedAppointments();
            } else if (currentUser?.email) {
                await loadUserAppointments();
            }
        } catch (err) {
            console.error('Failed to load appointments:', err);
        }
    }

    async function loadAllAppointments() {
        const result = await pb.collection('appointments').getFullList({
            sort: '-created',
            expand: 'user'
        });
        appointments = result;
    }

    async function loadApprovedAppointments() {
        const result = await pb.collection('appointments').getFullList({
            filter: 'status = "approved"',
            sort: '-created',
            expand: 'user'
        });
        appointments = result;
    }

    async function loadUserAppointments() {
        const result = await pb.collection('appointments').getFullList({
            filter: `visitor_email = "${currentUser.email}"`,
            sort: '-created',
            expand: 'user'
        });
        appointments = result;
    }

    function shouldIncludeAppointment(appt) {
        if (currentUser?.role === 'admin') {
            return true;
        } else if (currentUser?.role === 'front_desk') {
            return appt.status === 'approved';
        } else if (currentUser?.email) {
            return appt.visitor_email === currentUser.email;
        }
        return false;
    }

    async function rejectAppointment(id) {
        try {
            // Optimistically remove from local state
            appointments = appointments.filter(appt => appt.id !== id);
            
            await pb.collection('appointments').update(id, {
                status: 'rejected',
                approved_by: currentUser.id
            });
            
            // The realtime update will handle the final state
        } catch(err) {
            alert('Error: ' + err.message);
            // If error, reload appointments to restore correct state
            await loadInitialAppointments();
        }
    }

    
</script>

<h1 class="text-2xl font-bold text-gray-100 mx-5 my-5">
    {#if currentUser?.role === 'guest'}
        My Appointments
    {:else}
        Appointments <span class="text-sm font-normal">(Live Updates)</span>
    {/if}
</h1>

<p class="text-sm text-gray-200 mx-5 my-5">
    {appointments.length} appointment{#if appointments.length !== 1}s{/if} found
    {#if currentUser?.role === 'guest'}
        in your account
    {/if}
</p>

<AppointmentList 
    appointments={appointments} 
    onReject={rejectAppointment}
/>

<div class="flex justify-end mx-5 my-5">
    {#if currentUser?.role === 'admin' || currentUser?.role === 'guest'}
        <a href="/book" class="btn btn-success text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Appointment
        </a>
    {/if}
</div>