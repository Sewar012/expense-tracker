const API_URL = 'http://localhost:3000/api/expenses';

const tableBody = document.getElementById('expensesTableBody');
const addForm = document.getElementById('addExpenseForm');
const editForm = document.getElementById('editExpenseForm');
const filterCategory = document.getElementById('filterCategory');
const spinner = document.getElementById('spinner');
const alertContainer = document.getElementById('alertContainer');

const totalAmountEl = document.getElementById('totalAmount');
const totalCountEl = document.getElementById('totalCount');
const highestExpenseEl = document.getElementById('highestExpense');

let allExpenses = [];
let bsEditModal;

function showAlert(message, type = 'danger') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function toggleSpinner(show) {
  if (show) spinner.classList.remove('d-none');
  else spinner.classList.add('d-none');
}

async function fetchExpenses() {
  toggleSpinner(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch expenses from server.');
    
    allExpenses = await res.json();
    updateSummaryCards(allExpenses);
    CalculateAvg(allExpenses);
    renderTable(allExpenses);
  } catch (err) {
    showAlert('Server error or connection failed: ' + err.message);
  } finally {
    toggleSpinner(false);
  }
}

function updateSummaryCards(expenses) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const count = expenses.length;
  const highest = expenses.length > 0 ? Math.max(...expenses.map(item => Number(item.amount))) : 0;

  totalAmountEl.textContent = `$${total.toFixed(2)}`;
  totalCountEl.textContent = count;
  highestExpenseEl.textContent = `$${highest.toFixed(2)}`;
}

function CalculateAvg(expenses) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const count = expenses.length;
  return count > 0 ? total / count : 0;
}

function renderTable(expenses) {
  tableBody.innerHTML = '';
  if (expenses.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No expenses found.</td></tr>`;
    return;
  }

  expenses.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>$${Number(item.amount).toFixed(2)}</td>
      <td><span class="badge ${getCategoryBadge(item.category)}">${item.category}</span></td>
      <td>${item.date ? item.date.split('T')[0] : ''}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="openEditModal(${item.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${item.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function getCategoryBadge(category) {
  switch (category) {
    case 'Food': return 'bg-success';
    case 'Transport': return 'bg-info';
    case 'Bills': return 'bg-danger';
    case 'Entertainment': return 'bg-warning text-dark';
    default: return 'bg-secondary';
  }
}

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = document.getElementById('title').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;

  if (amount <= 0) {
    showAlert('Amount must be greater than zero.');
    return;
  }

  toggleSpinner(true);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, category, date })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error adding expense.');

    addForm.reset();
    showAlert('Expense added successfully!', 'success');
    await fetchExpenses();
  } catch (err) {
    showAlert(err.message);
  } finally {
    toggleSpinner(false);
  }
});

async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;

  toggleSpinner(true);
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error deleting expense.');

    showAlert('Expense deleted successfully.', 'success');
    await fetchExpenses();
  } catch (err) {
    showAlert(err.message);
  } finally {
    toggleSpinner(false);
  }
}

function openEditModal(id) {
  const item = allExpenses.find(e => e.id === id);
  if (!item) return;

  document.getElementById('editId').value = item.id;
  document.getElementById('editTitle').value = item.title;
  document.getElementById('editAmount').value = item.amount;
  document.getElementById('editCategory').value = item.category;
  document.getElementById('editDate').value = item.date ? item.date.split('T')[0] : '';

  bsEditModal = new bootstrap.Modal(document.getElementById('editModal'));
  bsEditModal.show();
}

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const id = document.getElementById('editId').value;
  const title = document.getElementById('editTitle').value.trim();
  const amount = parseFloat(document.getElementById('editAmount').value);
  const category = document.getElementById('editCategory').value;
  const date = document.getElementById('editDate').value;

  if (amount <= 0) {
    showAlert('Amount must be greater than zero.');
    return;
  }

  toggleSpinner(true);
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount, category, date })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error updating expense.');

    bsEditModal.hide();
    showAlert('Expense updated successfully!', 'success');
    await fetchExpenses();
  } catch (err) {
    showAlert(err.message);
  } finally {
    toggleSpinner(false);
  }
});

filterCategory.addEventListener('change', (e) => {
  const selected = e.target.value;
  if (selected === 'All') {
    renderTable(allExpenses);
  } else {
    const filtered = allExpenses.filter(item => item.category === selected);
    renderTable(filtered);
  }
});

document.addEventListener('DOMContentLoaded', fetchExpenses);