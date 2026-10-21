// ----- State -----
let tasks = [];            // { id, text, completed }
let currentFilter = 'all'; // 'all' | 'active' | 'completed'
const STORAGE_KEY = 'todoTasks';

// ----- Elements -----
const taskInput    = document.getElementById('taskInput');
const addBtn       = document.getElementById('addBtn');
const taskError    = document.getElementById('taskError');
const taskList     = document.getElementById('taskList');
const emptyMessage = document.getElementById('emptyMessage');
const taskCounter  = document.getElementById('taskCounter');
const clearBtn     = document.getElementById('clearBtn');
const filterBtns   = document.querySelectorAll('.filter-btn');

// ----- Local Storage ----- 
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) { /* storage unavailable: app still works */ }
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) tasks = saved;
  } catch (e) { tasks = []; }
}

// ----- Validation messages -----
function showError(message) {
  taskError.textContent = message;
  taskError.classList.remove('d-none');
  taskInput.classList.add('is-invalid');
}

function clearError() {
  taskError.classList.add('d-none');
  taskInput.classList.remove('is-invalid');
}

// ----- Add task -----
function addTask() {
  const text = taskInput.value.trim();

  if (text === '') {
    showError('Please enter a task. Empty or space-only tasks are not allowed.');
    taskInput.focus();
    return;
  }

  clearError();
  tasks.push({ id: Date.now(), text: text, completed: false });
  taskInput.value = '';
  taskInput.focus();
  saveTasks();
  render();
}

// ----- Toggle complete / active -----
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  render();
}

// ----- Delete one task -----
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// ----- Clear completed -----
function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

// ----- Filtering -----
function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach(btn => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle('btn-primary', active);
    btn.classList.toggle('btn-outline-primary', !active);
  });
  render();
}

function getVisibleTasks() {
  if (currentFilter === 'active') return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

// ----- Render -----
function render() {
  const visible = getVisibleTasks();
  taskList.innerHTML = '';

  visible.forEach(task => {
    const li = document.createElement('li');
    li.className = 'list-group-item task-item' + (task.completed ? ' completed' : '');

    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input mt-0';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text; // textContent prevents HTML injection

    label.append(checkbox, span);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-danger btn-sm';
    del.textContent = 'Delete';
    del.addEventListener('click', () => deleteTask(task.id));

    li.append(label, del);
    taskList.appendChild(li);
  });

  // Empty-state message
  if (visible.length === 0) {
    const messages = {
      all: 'No tasks yet. Add your first task!',
      active: 'No active tasks.',
      completed: 'No completed tasks.'
    };
    emptyMessage.textContent = messages[currentFilter];
    emptyMessage.classList.remove('d-none');
  } else {
    emptyMessage.classList.add('d-none');
  }

  // Counter: number of incomplete tasks (always across all tasks)
  const remaining = tasks.filter(t => !t.completed).length;
  taskCounter.textContent = remaining + ' remaining';
}

// ----- Events -----
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
taskInput.addEventListener('input', clearError);
clearBtn.addEventListener('click', clearCompleted);
filterBtns.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));

// ----- Init -----
loadTasks();
render();