/**
 * MindFlow Core Logic
 * Senior Frontend Approach: State-driven UI, Default Hidden Modules
 */

const API_URL = "http://localhost:8080/api/v1";

// Состояние приложения
const state = {
    isSmartMode: false, // Изначально выключено
    inbox: [],
    tasks: [],
    userName: "UserName"
};

document.addEventListener("DOMContentLoaded", () => {
    initApp();
    loadUserData();
});

function initApp() {
    // Регистрация событий
    const actions = {
        'add-task-btn-main': promptAddTask,
        'add-to-inbox-btn': promptAddTask,
        'mode-toggle': toggleSmartMode
    };

    Object.entries(actions).forEach(([id, fn]) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    });

    // Устанавливаем начальную видимость
    applyModeVisibility();
    render();
}

async function loadUserData() {
    try {
        const res = await fetch(`${API_URL}/user`);
        if (res.ok) {
            const data = await res.json();
            state.userName = data.full_name;
        }
    } catch (e) {
        console.log("Using fallback user data");
    }
    const titleEl = document.getElementById('header-title');
    if (titleEl) titleEl.textContent = `Доброго времени суток, ${state.userName}!`;
}

function promptAddTask() {
    const text = prompt("Опишите задачу:");
    if (text?.trim()) {
        state.inbox.push(text.trim());
        render();
    }
}

function toggleSmartMode() {
    state.isSmartMode = !state.isSmartMode;
    applyModeVisibility();
}

function applyModeVisibility() {
    const toggle = document.getElementById('mode-toggle');
    const circle = document.getElementById('toggle-circle');
    const icon = document.getElementById('toggle-icon');
    
    // Элементы, которыми управляем
    const modules = ['nav-tasks', 'nav-projects', 'card-tasks', 'card-projects'];

    if (state.isSmartMode) {
        toggle.className = "toggle-bg bg-indigo-600";
        circle.style.transform = "translateX(24px)";
        icon.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
    } else {
        toggle.className = "toggle-bg bg-slate-700";
        circle.style.transform = "translateX(0px)";
        icon.src = "https://images.icon-icons.com/1446/PNG/512/22212monkey_98814.png";
    }

    modules.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', !state.isSmartMode);
    });

    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
        tasksList.style.opacity = state.isSmartMode ? "1" : "0.4";
        tasksList.style.pointerEvents = state.isSmartMode ? "auto" : "none";
    }
}

function render() {
    const inboxList = document.getElementById('inbox-list');
    const tasksList = document.getElementById('tasks-list');
    const badge = document.getElementById('sidebar-inbox-count');
    const emptyState = document.getElementById('inbox-empty-state');

    if (inboxList) {
        inboxList.innerHTML = state.inbox.map((item, idx) => `
            <div class="task-row">
                <span class="font-medium">${item}</span>
                <button onclick="processToTask(${idx})" class="btn-process">Обработать</button>
            </div>
        `).join('');
    }

    if (tasksList) {
        tasksList.innerHTML = state.tasks.map((item, idx) => `
            <div class="active-task">
                <div class="flex items-center gap-3">
                    <i class="fa-regular fa-circle text-slate-300"></i>
                    <span class="font-medium">${item}</span>
                </div>
                <button onclick="finishTask(${idx})" class="btn-primary" style="padding: 4px 12px; font-size: 12px;">Готово</button>
            </div>
        `).join('');
    }

    if (badge) badge.textContent = state.inbox.length;
    if (emptyState) emptyState.classList.toggle('hidden', state.inbox.length > 0);
}

// Глобальные экшены (для onclick в строках)
window.processToTask = (idx) => {
    if (!state.isSmartMode) return alert("Перейдите в умный режим для обработки задач!");
    const [item] = state.inbox.splice(idx, 1);
    state.tasks.unshift(item);
    render();
};

window.finishTask = (idx) => {
    state.tasks.splice(idx, 1);
    render();
};