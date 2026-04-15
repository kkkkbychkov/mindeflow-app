/**
 * MindFlow Core
 * State Management & Monkey Mode Logic
 */

const state = {
    isSmartMode: false,
    inbox: [],
    tasks: [],
    currentFocus: null, // Задача, взятая через "Дай задачу"
    userName: "Дмитрий"
};

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // Регистрация оригинальных кнопок добавления
    const addActions = ['add-task-btn-main', 'add-to-inbox-btn'];
    addActions.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = handleAddNewTask;
    });

    // Регистрация управления режимом
    document.getElementById('mode-toggle').onclick = toggleAppMode;

    // Регистрация логики "Обезьяны"
    document.getElementById('get-task-monkey').onclick = takeTaskForFocus;
    document.getElementById('complete-monkey-task').onclick = finishFocusTask;

    applyInitialVisibility();
    render();
}

// Оригинальная логика добавления (через prompt)
function handleAddNewTask() {
    const text = prompt("Опишите задачу:");
    if (text?.trim()) {
        state.inbox.push(text.trim());
        render();
    }
}

// Логика "Дай задачу"
function takeTaskForFocus() {
    if (state.currentFocus) return; // Блокировка, если задача уже в работе
    
    if (state.inbox.length === 0) {
        alert("Входящие пусты! Сначала добавьте задачу.");
        return;
    }

    // Извлекаем ПЕРВУЮ задачу из списка (FIFO)
    state.currentFocus = state.inbox.shift();
    render();
}

function finishFocusTask() {
    state.currentFocus = null;
    render();
}

function toggleAppMode() {
    state.isSmartMode = !state.isSmartMode;
    applyInitialVisibility();
    render();
}

function applyInitialVisibility() {
    const isSmart = state.isSmartMode;
    const toggle = document.getElementById('mode-toggle');
    const circle = document.getElementById('toggle-circle');
    const icon = document.getElementById('toggle-icon');
    
    // Переключаем визуальное состояние тоггла
    toggle.classList.toggle('bg-indigo-600', isSmart);
    toggle.classList.toggle('bg-slate-700', !isSmart);
    circle.style.transform = isSmart ? "translateX(24px)" : "translateX(0px)";
    icon.src = isSmart 
        ? "https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
        : "https://images.icon-icons.com/1446/PNG/512/22212monkey_98814.png";

    // Управляем модулями
    const smartModules = ['nav-tasks', 'nav-projects', 'card-tasks'];
    smartModules.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', !isSmart);
    });

    // Модуль "Обезьяны" виден только в обычном режиме
    const monkeyModule = document.getElementById('monkey-action-area');
    if (monkeyModule) monkeyModule.classList.toggle('hidden', isSmart);
}

function render() {
    const inboxList = document.getElementById('inbox-list');
    const badge = document.getElementById('sidebar-inbox-count');
    const getTaskBtn = document.getElementById('get-task-monkey');
    const focusCard = document.getElementById('active-monkey-task-card');
    const focusText = document.getElementById('monkey-task-text');
    const emptyState = document.getElementById('inbox-empty-state');

    // Обновляем список Inbox
    inboxList.innerHTML = state.inbox.map((task, idx) => `
        <div class="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
            <span class="text-slate-700 font-medium">${task}</span>
            ${state.isSmartMode ? `<button onclick="moveToWork(${idx})" class="btn-secondary text-xs">В работу</button>` : ''}
        </div>
    `).join('');

    // Управление состоянием "Дай задачу"
    if (state.currentFocus) {
        getTaskBtn.disabled = true;
        getTaskBtn.textContent = "Задача выбрана";
        focusCard.classList.remove('hidden');
        focusText.textContent = state.currentFocus;
    } else {
        getTaskBtn.disabled = false;
        getTaskBtn.innerHTML = '<i class="fa-solid fa-bolt-lightning"></i> Дай задачу';
        focusCard.classList.add('hidden');
    }

    badge.textContent = state.inbox.length;
    emptyState.classList.toggle('hidden', state.inbox.length > 0 || state.currentFocus);
}

// Логика перемещения для Умного режима
window.moveToWork = (idx) => {
    const [task] = state.inbox.splice(idx, 1);
    state.tasks.unshift(task);
    render();
    
    // Обновляем визуализацию задач в работе
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = state.tasks.map(t => `
        <div class="p-3 bg-slate-50 rounded-xl mb-2 flex justify-between items-center">
            <span class="text-sm font-medium">${t}</span>
            <i class="fa-regular fa-circle text-slate-300"></i>
        </div>
    `).join('');
};