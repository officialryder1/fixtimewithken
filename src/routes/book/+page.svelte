<script>
    import { pb } from "$lib/pocketbase";

    let form = $state({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        duration: 30,
        purpose: ''
    })

    let loading = $state(false)
    let success = $state(false)

    async function bookAppointment() {
        loading = true;
        try {
        const datetime = new Date(`${form.date}T${form.time}`);
        
        await pb.collection('appointments').create({
            visitor_name: form.name,
            visitor_email: form.email,
            visitor_phone: form.phone,
            requested_date: datetime.toISOString(),
            duration: form.duration,
            purpose: form.purpose,
            status: 'requested'
        });
        
        success = true;
        form = {
            name: '',
            email: '',
            phone: '',
            date: '',
            time: '',
            duration: 30,
            purpose: ''
        };
        } catch (err) {
        alert('Booking failed: ' + err.message);
        } finally {
        loading = false;
        }
    }
</script>

<div class="booking-container">
  <h1>Book an Appointment</h1>
  
  {#if success}
    <div class="success-message">
      <h2>Thank you for your booking!</h2>
      <p>We'll contact you to confirm your appointment.</p>
      <a href="/" class="font-bold text-orange-500/90"> to track booked appointment</a>
    </div>
  {:else}
    <form on:submit|preventDefault={bookAppointment}>
      <div class="form-group">
        <label for="name">Full Name *</label>
        <input id="name" type="text" bind:value={form.name} required>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="email">Email *</label>
          <input id="email" type="email" bind:value={form.email} required>
        </div>
        
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input id="phone" type="tel" bind:value={form.phone}>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="date">Date *</label>
          <input id="date" type="date" bind:value={form.date} required 
                 min={new Date().toISOString().split('T')[0]}>
        </div>
        
        <div class="form-group">
          <label for="time">Time *</label>
          <input id="time" type="time" bind:value={form.time} required
                 min="09:00" max="17:00">
        </div>
        
        <div class="form-group">
          <label for="duration">Duration *</label>
          <select id="duration" bind:value={form.duration} class="bg-base-200">
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="purpose">Purpose *</label>
        <textarea id="purpose" bind:value={form.purpose} required></textarea>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  {/if}
</div>

<style>
  .booking-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
  
  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .form-group {
    flex: 1;
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    background: #4f46e5;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    opacity: 0.7;
  }
  
  .success-message {
    text-align: center;
    padding: 2rem;
    background: #f0fdf4;
    border-radius: 8px;
    color: black;
  }
</style>