const taskInput = document.getElementById('taskInput');
const dateTimeInput = document.getElementById('dateTimeInput');
const categorySelect = document.getElementById('categorySelect');
const repeatSelect = document.getElementById('repeatSelect');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const statsText = document.getElementById('statsText');
const scoreText = document.getElementById('scoreText');
const progressBar = document.getElementById('progressBar');
const themeToggle = document.getElementById('themeToggle');
const clearAllBtn = document.getElementById('clearAllBtn');
const searchBox = document.getElementById('searchBox');
const streakText = document.getElementById('streakText');
const toast = document.getElementById('toast');
const body = document.body;
const filterBtns = document.querySelectorAll('.filter-btn');

// عناصر إضافية جديدة
const openGuideBtn = document.getElementById('openGuideBtn');
const closeGuideBtn = document.getElementById('closeGuideBtn');
const guideModal = document.getElementById('guideModal');
const templateChips = document.querySelectorAll('.template-chip');
const nicknameInput = document.getElementById('nicknameInput');
const saveNicknameBtn = document.getElementById('saveNicknameBtn');
const leaderboardList = document.getElementById('leaderboardList');
const friendSearchInput = document.getElementById('friendSearchInput');
const addFriendBtn = document.getElementById('addFriendBtn');

let currentFilter = 'all';
let editIndex = null;

const savedTheme = localStorage.getItem('nexus_theme') || 'light';
body.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

// صوت رقمي داخلي مدمج
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
        } else if (type === 'delete' || type === 'penalty') {
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
let streak = JSON.parse(localStorage.getItem('nexus_streak')) || 0;
let score = JSON.parse(localStorage.getItem('nexus_score')) || 50;
let lastActiveTime = JSON.parse(localStorage.getItem('nexus_last_active')) || Date.now();
let myNickname = localStorage.getItem('nexus_nickname') || 'البطل';

if(nicknameInput) nicknameInput.value = myNickname !== 'البطل' ? myNickname : '';

// لوحة المتصدرين الافتراضية
let leaderboardData = JSON.parse(localStorage.getItem('nexus_leaderboard')) || [
    { name: 'يوسف برو 💻', score: 320 },
    { name: 'أمينة النشيطة 📚', score: 240 },
    { name: 'كريم السريع ⚡', score: 190 }
];

// فحص دقيق لـ 24 ساعة للـ Streak والتدهور
function checkDailyStreakAndDeterioration() {
    const now = Date.now();
    const hoursPassed = (now - lastActiveTime) / (1000 * 60 * 60);

    // إذا مرّت أكثر من 24 ساعة ولم ينجز المستخدم شيئاً
    if (hoursPassed >= 24) {
        streak = 0;
        score = Math.max(0, score - 25); // خصم نقاط التدهور
        playSound('penalty');
        showToast('⚠️ انتبه! لقد مرّت 24 ساعة دون أي إنجاز، مستواك في تدهور والـ Streak انصفر!', '#ef4444');
        lastActiveTime = now;
        localStorage.setItem('nexus_last_active', JSON.stringify(lastActiveTime));
        saveAndRender();
    }
}
setInterval(checkDailyStreakAndDeterioration, 60000); // التحقق كل دقيقة
checkDailyStreakAndDeterioration();

streakText.textContent = `🔥 ${streak} يوم`;
if(scoreText) scoreText.textContent = `النقاط: ${score} ⭐`;

function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem('nexus_score', JSON.stringify(score));
    localStorage.setItem('nexus_streak', JSON.stringify(streak));
    renderTasks(searchBox.value);
    updateLeaderboard();
}

function updateLeaderboard() {
    const myIndex = leaderboardData.findIndex(item => item.me);
    if (myIndex !== -1) {
        leaderboardData[myIndex].score = score;
        leaderboardData[myIndex].name = myNickname + ' (أنت)';
    } else {
        leaderboardData.push({ name: myNickname + ' (أنت)', score: score, me: true });
    }

    leaderboardData.sort((a, b) => b.score - a.score);
    localStorage.setItem('nexus_leaderboard', JSON.stringify(leaderboardData));

    if(leaderboardList) {
        leaderboardList.innerHTML = '';
        leaderboardData.forEach((user, index) => {
            const li = document.createElement('li');
            li.className = `leaderboard-item ${user.me ? 'me' : ''}`;
            li.innerHTML = `
                <span>#${index + 1} ${user.name}</span>
                <span style="font-weight:bold; color:#4f46e5;">${user.score} ⭐</span>
            `;
            leaderboardList.appendChild(li);
        });
    }
}

function renderTasks(filterText = '') {
    if(!taskList) return;
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
                if (!task.penalized) {
                    task.penalized = true;
                    score = Math.max(0, score - 10);
                    playSound('penalty');
                    showToast(`⚠️ فات موعد المهمة: "${task.text}"`, '#ef4444');
                }
            }
        }

        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        taskInfo.addEventListener('click', () => {
            tasks[originalIndex].completed = !tasks[originalIndex].completed;
            lastActiveTime = Date.now(); // تحديث توقيت آخر تفاعل
            localStorage.setItem('nexus_last_active', JSON.stringify(lastActiveTime));

            if (tasks[originalIndex].completed) {
                score += 20;
                streak += 1; // زيادة الـ Streak مع إنجاز المهمة
                playSound('complete');
                showToast('تم إنجاز المهمة بنجاح! +20 ⭐ +1 يوم Streak');
            } else {
                score = Math.max(0, score - 20);
                streak = Math.max(0, streak - 1);
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
    if(scoreText) scoreText.textContent = `النقاط: ${score} ⭐`;
    if(streakText) streakText.textContent = `🔥 ${streak} يوم`;
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
            alerted: false,
            penalized: false
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
            alerted: false,
            penalized: false
        });
        showToast('تمت إضافة المهمة بنجاح!');
    }

    taskInput.value = '';
    dateTimeInput.value = '';
    taskInput.focus();
    playSound('add');
    saveAndRender();
}

// فحص التنبيهات
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

    if (needsUpdate) saveAndRender();
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
                score += 30;
                showToast('🎉 انتهت جلسة التركيز بنجاح! +30 نقطة');
                isRunning = false;
                pomoStart.textContent = 'بدء التركيز';
                saveAndRender();
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

// الأزرار التفاعلية والقب والأصدقاء والدليل المنبثق
if(templateChips) {
    templateChips.forEach(chip => {
        chip.addEventListener('click', () => {
            taskInput.value = chip.getAttribute('data-task');
            categorySelect.value = 'Study';
            taskInput.focus();
        });
    });
}

if(saveNicknameBtn) {
    saveNicknameBtn.addEventListener('click', () => {
        const name = nicknameInput.value.trim();
        if (name) {
            myNickname = name;
            localStorage.setItem('nexus_nickname', myNickname);
            showToast('تم حفظ اللقب بنجاح! 🏆');
            updateLeaderboard();
        } else {
            showToast('الرجاء إدخال لقب صالح!', '#f59e0b');
        }
    });
}

if(addFriendBtn) {
    addFriendBtn.addEventListener('click', () => {
        const friendName = friendSearchInput.value.trim();
        if (friendName) {
            leaderboardData.push({ name: friendName + ' ⚔️', score: Math.floor(Math.random() * 150) + 50 });
            friendSearchInput.value = '';
            showToast(`تمت إضافة الصديق "${friendName}" للتحدي!`);
            updateLeaderboard();
        } else {
            showToast('اكتب اسم الصديق أولاً!', '#f59e0b');
        }
    });
}

if(openGuideBtn && guideModal) {
    openGuideBtn.addEventListener('click', () => guideModal.classList.add('active'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if(e.target === guideModal) guideModal.classList.remove('active');
    });
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
searchBox.addEventListener('input', (e) => { renderTasks(e.target.value); });

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
updateLeaderboard();