document.getElementById('waitlist-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const msg = document.getElementById('form-message');
  const email = form.email.value.trim();
  const zip = form.zip.value.trim();

  btn.disabled = true;
  btn.textContent = 'Submitting…';
  msg.textContent = '';
  msg.className = 'form-message';

  try {
    const res = await fetch('/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, zip }),
    });
    const data = await res.json();

    if (res.ok) {
      msg.textContent = "You're on the list! We'll be in touch when we launch near you.";
      msg.className = 'form-message success';
      form.reset();
    } else {
      msg.textContent = data.error || 'Something went wrong. Please try again.';
      msg.className = 'form-message error';
    }
  } catch {
    msg.textContent = 'Network error. Please check your connection and try again.';
    msg.className = 'form-message error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Join the waitlist';
  }
});
