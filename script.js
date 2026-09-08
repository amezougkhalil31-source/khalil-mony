const taskInput = document.getElementById('taskInput');
const dateTimeInput = document.getElementById('dateTimeInput');
const categorySelect = document.getElementById('categorySelect');
const repeatSelect = document.getElementById('repeatSelect');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const statsText = document.getElementById('statsText');
const progressBar = document.getElementById('progressBar');
const themeToggle = document.getElementById('themeToggle');
const clearAllBtn = document.getElementById('clearAllBtn');
const searchBox = document.getElementById('searchBox');
const streakText = document.getElementById('streakText');
const toast = document.getElementById('toast');
const body = document.body;
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let editIndex = null;

const savedTheme = localStorage.getItem('nexus_theme') || 'light';
body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'add') {
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'complete' || type === 'alert') {
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        } else if (type === 'delete') {
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        }
    } catch(e) {}
}

function showToast(message, color = '#10b981') {
    toast.textContent = message;
    toast.style.background = color;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

const pomoTimer = document.getElementById('pomoTimer');
const pomoStart = document.getElementById('pomoStart');
const pomoReset = document.getElementById('pomoReset');
let pomoInterval;
let timeLeft = 1500;
let isRunning = false;

const STORAGE_KEY = 'nexus_tasks_master_db';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let streak = JSON.parse(localStorage.getItem('nexus_streak')) || 1;
streakText.textContent = `🔥 ${streak} يوم`;

function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    renderTasks(searchBox.value);
}

function renderTasks(filterText = '') {
    taskList.innerHTML = '';
    let completedCount = 0;
    const totalTasks = tasks.length;
    const now = new Date();

    tasks.forEach((task) => {
        if (task.completed) completedCount++;
    });

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(filterText.toLowerCase());
        if (currentFilter === 'active') return matchesSearch && !task.completed;
        if (currentFilter === 'completed') return matchesSearch && task.completed;
        return matchesSearch;
    });

    filteredTasks.forEach((task) => {
        const originalIndex = tasks.indexOf(task);
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        if (task.datetime && !task.completed) {
            const taskDate = new Date(task.datetime);
            if (now > taskDate) {
                li.classList.add('expired');
            }
        }

        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        taskInfo.addEventListener('click', () => {
            tasks[originalIndex].completed = !tasks[originalIndex].completed;
            if (tasks[originalIndex].completed) {
                playSound('complete');
                showToast('تم إنجاز المهمة! 🎉');
            }
            saveAndRender();
        });

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.text;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';
        
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = task.category;

        const repeatBadge = document.createElement('span');
        repeatBadge.className = 'repeat-badge';
        repeatBadge.textContent = `🔁 ${task.repeat}`;
        
        const dateSpan = document.createElement('span');
        dateSpan.textContent = task.datetime ? `⏰ ${task.datetime.replace('T', ' ')}` : '';

        detailsDiv.appendChild(badge);
        if(task.repeat !== 'None') detailsDiv.appendChild(repeatBadge);
        detailsDiv.appendChild(dateSpan);

        taskInfo.appendChild(titleSpan);
        taskInfo.appendChild(detailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'تعديل';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            taskInput.value = task.text;
            categorySelect.value = task.category;
            repeatSelect.value = task.repeat;
            dateTimeInput.value = task.datetime;
            editIndex = originalIndex;
            addBtn.textContent = 'تحديث المهمة';
            taskInput.focus();
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'حذف';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tasks.splice(originalIndex, 1);
            playSound('delete');
            showToast('تم حذف المهمة', '#ef4444');
            saveAndRender();
        });

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(taskInfo);
        li.appendChild(actionsDiv);
        taskList.appendChild(li);
    });

    statsText.textContent = `المكتملة: ${completedCount} / ${totalTasks}`;
    const progressPercent = totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100;
    progressBar.style.width = `${progressPercent}%`;
}

function addTask() {
    const text = taskInput.value.trim();
    const category = categorySelect.value;
    const repeat = repeatSelect.value;
    const datetime = dateTimeInput.value;

    if (text === '') {
        showToast('الرجاء كتابة اسم المهمة!', '#f59e0b');
        return;
    }

    if (editIndex !== null) {
        tasks[editIndex] = { 
            ...tasks[editIndex],
            text: text, 
            category: category, 
            repeat: repeat, 
            datetime: datetime, 
            alerted: false 
        };
        editIndex = null;
        addBtn.textContent = 'إضافة مهمة مع تنبيه';
        showToast('تم تحديث المهمة بنجاح!');
    } else {
        tasks.push({ 
            text: text, 
            completed: false, 
            category: category, 
            repeat: repeat, 
            datetime: datetime, 
            alerted: false 
        });
        showToast('تمت إضافة المهمة والتنبيه بنجاح!');
    }

    taskInput.value = '';
    dateTimeInput.value = '';
    taskInput.focus();
    playSound('add');
    saveAndRender();
}

setInterval(() => {
    const now = new Date();
    let needsUpdate = false;
    
    tasks.forEach(task => {
        if (task.datetime && !task.completed && !task.alerted) {
            const taskDate = new Date(task.datetime);
            if (now.getTime() >= taskDate.getTime()) {
                task.alerted = true;
                needsUpdate = true;
                playSound('alert');
                showToast(`⏰ انتهى وقت المهمة: "${task.text}"`, '#ef4444');
            }
        }
    });

    if (needsUpdate) {
        saveAndRender();
    }
}, 1000);

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    pomoTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

pomoStart.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        pomoStart.textContent = 'إيقاف موقت';
        pomoInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(pomoInterval);
                playSound('complete');
                showToast('انتهت جلسة التركيز!');
                isRunning = false;
                pomoStart.textContent = 'بدء التركيز';
            }
        }, 1000);
    } else {
        clearInterval(pomoInterval);
        isRunning = false;
        pomoStart.textContent = 'بدء التركيز';
    }
});

pomoReset.addEventListener('click', () => {
    clearInterval(pomoInterval);
    isRunning = false;
    timeLeft = 1500;
    updateTimerDisplay();
    pomoStart.textContent = 'بدء التركيز';
});

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

searchBox.addEventListener('input', (e) => {
    renderTasks(e.target.value);
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks(searchBox.value);
    });
});

clearAllBtn.addEventListener('click', () => {
    tasks = [];
    playSound('delete');
    showToast('تم مسح جميع المهام', '#ef4444');
    saveAndRender();
});

themeToggle.addEventListener('click', () => {
    if (body.getAttribute('data-theme') === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('nexus_theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.textContent = '🌙';
        localStorage.setItem('nexus_theme', 'light');
    }
});

renderTasks();