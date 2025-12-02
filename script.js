// Replace with your Render backend URL
const API = 'https://expense-tracker-backend-ux5q.onrender.com';

async function loadExpenses() {
  try {
    const res = await fetch(`${API}/expenses`);
    if (!res.ok) throw new Error('Failed to load expenses: ' + res.status);
    const data = await res.json();
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    if (!Array.isArray(data) || data.length === 0) {
      list.innerHTML = '<li>No expenses yet.</li>';
      return;
    }
    data.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${escapeHtml(item.title)} — ₹${Number(item.amount).toFixed(2)}</span>
                      <button class="delete-btn" data-id="${item.id}">Delete</button>`;
      list.appendChild(li);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Delete this expense?')) return;
        await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
        loadExpenses();
      });
    });
  } catch (err) {
    console.error(err);
    alert('Error loading expenses. Open backend and check console.');
  }
}

async function addExpense() {
  const titleEl = document.getElementById('title');
  const amountEl = document.getElementById('amount');
  const title = titleEl.value.trim();
  const amount = parseFloat(amountEl.value);
  if (!title || isNaN(amount) || amount <= 0) {
    alert('Enter a valid title and amount');
    return;
  }
  try {
    const res = await fetch(`${API}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount })
    });
    const json = await res.json();
    console.log('Add response:', json);
    if (!res.ok) {
      alert('Add failed: ' + (json.error || JSON.stringify(json)));
      return;
    }
    titleEl.value = '';
    amountEl.value = '';
    loadExpenses();
  } catch (err) {
    console.error('Add error:', err);
    alert('Cannot connect to backend. Is node server running?');
  }
}

function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

document.getElementById('addBtn').addEventListener('click', addExpense);
window.addEventListener('DOMContentLoaded', loadExpenses);
