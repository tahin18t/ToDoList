// Frontend SPA for ToDoList using the provided Express APIs
// Uses token-key header for authenticated routes

const state = {
  token: localStorage.getItem('token') || null,
  profile: null,
  todos: [],
  filters: { status: '', from: '', to: '' },
};

const API = {
  base: '/api/v1',
  headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    if (state.token) h['token-key'] = state.token;
    return h;
  },
  async request(path, { method = 'GET', body, headers } = {}) {
    const init = { method, headers: this.headers(headers) };
    if (body) init.body = JSON.stringify(body);
    const res = await fetch(`${this.base}${path}`, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  },
  // Auth & Profile
  login: (UserName, Password) => API.request('/UserLogin', { method: 'POST', body: { UserName, Password } }),
  register: (payload) => API.request('/createProfile', { method: 'POST', body: payload }),
  selectProfile: () => API.request('/SelectProfile'),
  updateProfile: (payload) => API.request('/UpdateProfile', { method: 'POST', body: payload }),
  // Todos
  listTodos: () => API.request('/ToDoList'),
  createTodo: (payload) => API.request('/CreateToDo', { method: 'POST', body: payload }),
  updateTodo: (payload) => API.request('/UpdateToDo', { method: 'POST', body: payload }),
  updateStatus: (_id, Status) => API.request('/UpdateStatus', { method: 'POST', body: { _id, Status } }),
  removeTodo: (_id) => API.request('/RemoveToDo', { method: 'DELETE', body: { _id } }),
};

// Elements
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const el = {
  authView: $('#authView'),
  appView: $('#appView'),
  userMenu: $('#userMenu'),
  userNameBadge: $('#userNameBadge'),
  logoutBtn: $('#logoutBtn'),
  tabLogin: $('#tabLogin'),
  tabRegister: $('#tabRegister'),
  loginForm: $('#loginForm'),
  registerForm: $('#registerForm'),
  createTodoForm: $('#createTodoForm'),
  profileForm: $('#profileForm'),
  filterStatus: $('#filterStatus'),
  filterFrom: $('#filterFrom'),
  filterTo: $('#filterTo'),
  applyFilters: $('#applyFilters'),
  clearFilters: $('#clearFilters'),
  todoList: $('#todoList'),
  listSummary: $('#listSummary'),
  toast: $('#toast'),
};

// UI Helpers
function showToast(msg, type = 'success') {
  el.toast.textContent = msg;
  el.toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
  el.toast.style.display = 'block';
  setTimeout(() => (el.toast.style.display = 'none'), 2200);
}

function setAuthUI(loggedIn) {
  if (loggedIn) {
    el.authView.classList.add('hidden');
    el.appView.classList.remove('hidden');
    el.userMenu.classList.remove('hidden');
    el.userNameBadge.textContent = state.profile?.UserName || '';
  } else {
    el.authView.classList.remove('hidden');
    el.appView.classList.add('hidden');
    el.userMenu.classList.add('hidden');
    el.userNameBadge.textContent = '';
  }
}

function switchTab(tab) {
  if (tab === 'login') {
    el.tabLogin.classList.add('active');
    el.tabRegister.classList.remove('active');
    el.loginForm.classList.remove('hidden');
    el.registerForm.classList.add('hidden');
  } else {
    el.tabRegister.classList.add('active');
    el.tabLogin.classList.remove('active');
    el.registerForm.classList.remove('hidden');
    el.loginForm.classList.add('hidden');
  }
}

function getFormData(form) {
  const fd = new FormData(form);
  return Object.fromEntries([...fd.entries()].map(([k, v]) => [k, v.trim?.() ?? v]));
}

function renderTodos() {
  const { status, from, to } = state.filters;
  let list = [...state.todos];

  if (status) list = list.filter((t) => (t.ToDoStatus || '').toLowerCase() === status.toLowerCase());
  if (from) list = list.filter((t) => t.CreateDate && new Date(t.CreateDate) >= new Date(from));
  if (to) list = list.filter((t) => t.CreateDate && new Date(t.CreateDate) <= new Date(to + 'T23:59:59'));

  el.listSummary.textContent = `${list.length} item(s)`;

  if (!list.length) {
    el.todoList.innerHTML = `<div class="text-slate-500 text-sm">No todos match your filters.</div>`;
    return;
  }

  el.todoList.innerHTML = list
    .map((t) => {
      const status = (t.ToDoStatus || 'New').toLowerCase();
      const badgeClass =
        status === 'completed' ? 'badge-completed' :
        status === 'progress' ? 'badge-progress' :
        status === 'cancelled' ? 'badge-cancelled' : 'badge-new';
      const created = t.CreateDate ? new Date(t.CreateDate).toLocaleString() : '-';
      const updated = t.UpdateDate ? new Date(t.UpdateDate).toLocaleString() : '-';
      return `
        <div class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold">${escapeHtml(t.ToDoSubject || '')}</h3>
                <span class="badge ${badgeClass}">${escapeHtml(t.ToDoStatus || 'New')}</span>
              </div>
              <p class="text-sm text-slate-600 mt-1">${escapeHtml(t.ToDoDescription || '')}</p>
              <div class="text-xs text-slate-400 mt-2">Created: ${created} • Updated: ${updated}</div>
            </div>
            <div class="flex items-center gap-2">
              <select class="input text-sm" data-action="set-status" data-id="${t._id}">
                ${['New','Progress','Completed','Cancelled'].map(s => `<option ${s=== (t.ToDoStatus||'New') ? 'selected':''}>${s}</option>`).join('')}
              </select>
              <button class="btn-secondary" data-action="edit" data-id="${t._id}">Edit</button>
              <button class="btn-ghost" data-action="delete" data-id="${t._id}">Delete</button>
            </div>
          </div>
          <div class="hidden mt-4" id="edit-${t._id}">
            <div class="grid md:grid-cols-2 gap-2">
              <input class="input" type="text" placeholder="Subject" value="${escapeAttr(t.ToDoSubject || '')}" />
              <input class="input" type="text" placeholder="Description" value="${escapeAttr(t.ToDoDescription || '')}" />
            </div>
            <div class="mt-2 flex gap-2">
              <button class="btn-primary" data-action="save" data-id="${t._id}">Save</button>
              <button class="btn-ghost" data-action="cancel-edit" data-id="${t._id}">Cancel</button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
function escapeAttr(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Event Handlers
el.tabLogin.addEventListener('click', () => switchTab('login'));
el.tabRegister.addEventListener('click', () => switchTab('register'));

el.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { UserName, Password } = getFormData(el.loginForm);
  try {
    const res = await API.login(UserName, Password);
    state.token = res.token;
    localStorage.setItem('token', state.token);
    await bootstrapAfterLogin();
    showToast('Logged in successfully');
  } catch (err) {
    showToast(err?.data || 'Login failed', 'error');
  }
});

el.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = getFormData(el.registerForm);
  try {
    await API.register(payload);
    switchTab('login');
    showToast('Account created. Please login.');
  } catch (err) {
    showToast(err?.data || 'Registration failed', 'error');
  }
});

el.logoutBtn.addEventListener('click', () => {
  state.token = null;
  state.profile = null;
  state.todos = [];
  localStorage.removeItem('token');
  setAuthUI(false);
});

el.createTodoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { ToDoSubject, ToDoDescription } = getFormData(el.createTodoForm);
  try {
    await API.createTodo({ ToDoSubject, ToDoDescription });
    el.createTodoForm.reset();
    await loadTodos();
    showToast('ToDo created');
  } catch {
    showToast('Failed to create todo', 'error');
  }
});

el.profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = getFormData(el.profileForm);
  // Remove disabled or empty fields to avoid overwriting unintentionally
  const payload = {};
  ['FirstName','LastName','Email','Phone','Password'].forEach(k => {
    if (data[k]) payload[k] = data[k];
  });
  try {
    await API.updateProfile(payload);
    await loadProfile();
    showToast('Profile updated');
  } catch {
    showToast('Failed to update profile', 'error');
  }
});

el.applyFilters.addEventListener('click', (e) => {
  e.preventDefault();
  state.filters.status = el.filterStatus.value;
  state.filters.from = el.filterFrom.value;
  state.filters.to = el.filterTo.value;
  renderTodos();
});

el.clearFilters.addEventListener('click', (e) => {
  e.preventDefault();
  el.filterStatus.value = '';
  el.filterFrom.value = '';
  el.filterTo.value = '';
  state.filters = { status: '', from: '', to: '' };
  renderTodos();
});

// Delegated events for todo actions
el.todoList.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');
  if (!id || !action) return;

  if (action === 'edit') {
    const row = document.getElementById(`edit-${id}`);
    row?.classList.remove('hidden');
  }
  if (action === 'cancel-edit') {
    const row = document.getElementById(`edit-${id}`);
    row?.classList.add('hidden');
  }
  if (action === 'save') {
    const row = document.getElementById(`edit-${id}`);
    const [subjInp, descInp] = row.querySelectorAll('input');
    try {
      await API.updateTodo({ _id: id, ToDoSubject: subjInp.value, ToDoDescription: descInp.value });
      await loadTodos();
      showToast('Updated');
    } catch {
      showToast('Update failed', 'error');
    }
  }
  if (action === 'delete') {
    if (!confirm('Delete this ToDo?')) return;
    try {
      await API.removeTodo(id);
      await loadTodos();
      showToast('Removed');
    } catch {
      showToast('Delete failed', 'error');
    }
  }
});

el.todoList.addEventListener('change', async (e) => {
  const sel = e.target.closest('select[data-action="set-status"]');
  if (!sel) return;
  const id = sel.getAttribute('data-id');
  const Status = sel.value;
  try {
    await API.updateStatus(id, Status);
    await loadTodos();
    showToast('Status updated');
  } catch {
    showToast('Failed to update status', 'error');
  }
});

// Data Loaders
async function loadProfile() {
  const res = await API.selectProfile();
  state.profile = res.data || null;
  if (state.profile) {
    el.userNameBadge.textContent = state.profile.UserName || '';
    // Populate form
    el.profileForm.elements['FirstName'].value = state.profile.FirstName || '';
    el.profileForm.elements['LastName'].value = state.profile.LastName || '';
    el.profileForm.elements['UserName'].value = state.profile.UserName || '';
    el.profileForm.elements['Email'].value = state.profile.Email || '';
    el.profileForm.elements['Phone'].value = state.profile.Phone || '';
    el.profileForm.elements['Password'].value = '';
  }
}

async function loadTodos() {
  const res = await API.listTodos();
  state.todos = res.data || [];
  renderTodos();
}

async function bootstrapAfterLogin() {
  try {
    await loadProfile();
    await loadTodos();
    setAuthUI(true);
  } catch (e) {
    // Likely token mismatch or backend secret mismatch
    setAuthUI(false);
    showToast('Auth failed. Please login again.', 'error');
  }
}

// Init
(function init() {
  if (state.token) {
    bootstrapAfterLogin();
  } else {
    setAuthUI(false);
  }
})();
