// ==========================================
// 1. تحديد كافة عناصر الـ DOM
// ==========================================
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
const langSelect = document.getElementById('langSelect');
const body = document.body;
const filterBtns = document.querySelectorAll('.filter-btn');

// عناصر نافذة الترحيب الأولى (Onboarding)
const welcomeModal = document.getElementById('welcomeModal');
const welcomeNickname = document.getElementById('welcomeNickname');
const welcomeEmail = document.getElementById('welcomeEmail');
const startAppBtn = document.getElementById('startAppBtn');

// عناصر الدليل التعليمي وقوالب المهام
const openGuideBtn = document.getElementById('openGuideBtn');
const closeGuideBtn = document.getElementById('closeGuideBtn');
const guideModal = document.getElementById('guideModal');
const templateChips = document.querySelectorAll('.template-chip');
const leaderboardList = document.getElementById('leaderboardList');

// عناصر تحدي الأصدقاء (1 vs 1)
const openDuelModalBtn = document.getElementById('openDuelModalBtn');
const closeDuelModal = document.getElementById('closeDuelModal');
const duelModal = document.getElementById('duelModal');
const targetFriendInput = document.getElementById('targetFriendInput');
const sendDuelRequestBtn = document.getElementById('sendDuelRequestBtn');
const duelRequestsList = document.getElementById('duelRequestsList');
const friendAutocompleteList = document.getElementById('friendAutocompleteList');

// عناصر مؤقت البومودورو
const pomoTimer = document.getElementById('pomoTimer');
const pomoStart = document.getElementById('pomoStart');
const pomoReset = document.getElementById('pomoReset');

// ==========================================
// 2. المتغيرات العامة وحالة التطبيق
// ==========================================
let currentFilter = 'all';
let editIndex = null;
let pomoInterval = null;
let timeLeft = 1500;
let isRunning = false;

const STORAGE_KEY = 'nexus_tasks_master_db';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let streak = JSON.parse(localStorage.getItem('nexus_streak')) || 0;
let score = JSON.parse(localStorage.getItem('nexus_score')) || 50;
let lastActiveTime = JSON.parse(localStorage.getItem('nexus_last_active')) || Date.now();
let myNickname = localStorage.getItem('nexus_nickname') || '';
let myEmail = localStorage.getItem('nexus_email') || '';

let leaderboardData = JSON.parse(localStorage.getItem('nexus_leaderboard')) || [];
let myDuelRequests = JSON.parse(localStorage.getItem('nexus_duel_requests')) || [];
let activeDuels = JSON.parse(localStorage.getItem('nexus_active_duels')) || [];

// ضبط المظهر الأولي (Light/Dark Theme)
const savedTheme = localStorage.getItem('nexus_theme') || 'light';
body.setAttribute('data-theme', savedTheme);
if (themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

// ==========================================
// 3. الصوتيات والمؤثرات البرمجية
// ==========================================
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
    } catch (e) {
        // تجاهل أخطاء تشغيل الصوت في المتصفحات التي تحظر Autoplay
    }
}

function showToast(message, color = '#10b981') {
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = color;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==========================================
// 4. إعدادات التسجيل الأول (Onboarding & Email)
// ==========================================
if (myNickname) {
    if (welcomeModal) welcomeModal.style.display = 'none';
} else {
    if (welcomeModal) welcomeModal.style.display = 'flex';
}

if (startAppBtn) {
    startAppBtn.addEventListener('click', () => {
        const nickname = welcomeNickname.value.trim();
        const email = welcomeEmail.value.trim();

        if (!nickname) {
            showToast('⚠️ المرجو إدخال اللقب للبدء والمنافسة في المتصدرين!', '#f59e0b');
            return;
        }

        myNickname = nickname;
        localStorage.setItem('nexus_nickname', myNickname);

        if (email) {
            myEmail = email;
            localStorage.setItem('nexus_email', myEmail);
            sendWelcomeEmail(myEmail, myNickname);
        }

        if (welcomeModal) welcomeModal.style.display = 'none';
        showToast(`أهلاً بك يا ${myNickname} في Nexus Task! 🚀`);
        updateLeaderboard();
    });
}

function sendWelcomeEmail(email, nickname) {
    const templateParams = {
        to_email: email,
        to_name: nickname,
        message: 'مرحباً بك في Nexus Task! تم تفعيل حسابك بنجاح للبدء في تنظيم أهدافك وتحدي أصدقائك.'
    };

    if (typeof emailjs !== 'undefined') {
        emailjs.send('default_service', 'template_welcome', templateParams, 'YOUR_PUBLIC_KEY')
            .then(() => {
                showToast('📩 تم إرسال رسالة ترحيبية إلى بريدك الإلكتروني!');
            }).catch(() => {});
    } else {
        console.log(`[Email System] Welcome email simulated for: ${email}`);
    }
}

// ==========================================
// 5. نظام التحفيز والتدهور اليومي (Streak)
// ==========================================
function triggerLiveBot(type) {
    if (type === 'good') {
        const msgs = [
            `🤖 البوت: برافو عليك يا ${myNickname}! أداء رائع، استمر هكذا! 🔥`,
            `🤖 البوت: إنجاز ممتاز! مستواك في تصاعد مستمر نحو القمة 🚀`,
            `🤖 البوت: خطوة رائعة نحو أهدافك اليوم! 🌟`
        ];
        showToast(msgs[Math.floor(Math.random() * msgs.length)], '#10b981');
    } else if (type === 'bad') {
        const msgs = [
            `🤖 البوت: انتبه يا ${myNickname}! تمر ساعات بدون إنجاز مهام ⚠️`,
            `🤖 البوت: التسويف يقلل نقاطك! أنجز مهمة الآن لتستعيد مستواك 💪`,
            `🤖 البوت: عُد بقوة ولا تدع الكسل يكسر الـ Streak! ⚡`
        ];
        showToast(msgs[Math.floor(Math.random() * msgs.length)], '#ef4444');
    }
}

function checkDailyStreakAndDeterioration() {
    const now = Date.now();
    const hoursPassed = (now - lastActiveTime) / (1000 * 60 * 60);

    if (hoursPassed >= 24) {
        streak = 0;
        score = Math.max(0, score - 25);
        playSound('penalty');
        triggerLiveBot('bad');
        lastActiveTime = now;
        localStorage.setItem('nexus_last_active', JSON.stringify(lastActiveTime));
        saveAndRender();
    }
}
setInterval(checkDailyStreakAndDeterioration, 60000);
checkDailyStreakAndDeterioration();

// ==========================================
// 6. الحفظ وعرض المهام ومتصدرين العالم
// ==========================================
function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem('nexus_score', JSON.stringify(score));
    localStorage.setItem('nexus_streak', JSON.stringify(streak));
    renderTasks(searchBox ? searchBox.value : '');
    updateLeaderboard();
}

function updateLeaderboard() {
    if (!myNickname) return;
    
    const myIndex = leaderboardData.findIndex(item => item.name.includes(myNickname) && item.me);
    if (myIndex !== -1) {
        leaderboardData[myIndex].score = score;
        leaderboardData[myIndex].name = `${myNickname} (أنت)`;
    } else {
        leaderboardData.push({ name: `${myNickname} (أنت)`, score: score, me: true });
    }

    leaderboardData.sort((a, b) => b.score - a.score);
    localStorage.setItem('nexus_leaderboard', JSON.stringify(leaderboardData));

    if (leaderboardList) {
        leaderboardList.innerHTML = '';
        if (leaderboardData.length === 0) {
            leaderboardList.innerHTML = '<li style="font-size:12px; opacity:0.7; text-align:center; padding:10px;">لا يوجد متصدرين بعد.</li>';
            return;
        }

        leaderboardData.forEach((user, index) => {
            const li = document.createElement('li');
            li.className = `leaderboard-item ${user.me ? 'me' : ''}`;
            li.innerHTML = `
                <span>#${index + 1} ${user.name}</span>
                <span style="font-weight:bold; color:var(--primary-color);">${user.score} ⭐</span>
            `;
            leaderboardList.appendChild(li);
        });
    }
}

function renderTasks(filterText = '') {
    if (!taskList) return;
    taskList.innerHTML = '';
    let completedCount = 0;
    const totalTasks = tasks.length;
    const now = new Date();

    tasks.forEach(task => {
        if (task.completed) completedCount++;
    });

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(filterText.toLowerCase());
        if (currentFilter === 'active') return matchesSearch && !task.completed;
        if (currentFilter === 'completed') return matchesSearch && task.completed;
        return matchesSearch;
    });

    filteredTasks.forEach(task => {
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
                    triggerLiveBot('bad');
                    showToast(`⚠️ انتهاء موعد: "${task.text}"`, '#ef4444');
                }
            }
        }

        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        taskInfo.style.cursor = 'pointer';
        taskInfo.style.flex = '1';
        taskInfo.addEventListener('click', () => {
            tasks[originalIndex].completed = !tasks[originalIndex].completed;
            lastActiveTime = Date.now();
            localStorage.setItem('nexus_last_active', JSON.stringify(lastActiveTime));

            if (tasks[originalIndex].completed) {
                score += 20;
                streak += 1;
                playSound('complete');
                triggerLiveBot('good');
                showToast('تم إنجاز المهمة بنجاح! +20 ⭐');
            } else {
                score = Math.max(0, score - 20);
                streak = Math.max(0, streak - 1);
            }
            saveAndRender();
        });

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.style.display = 'block';
        titleSpan.style.fontWeight = 'bold';
        titleSpan.textContent = task.text;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';
        detailsDiv.style.fontSize = '11px';
        detailsDiv.style.opacity = '0.8';
        detailsDiv.style.marginTop = '4px';
        
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.style.marginEnd = '6px';
        badge.textContent = `📁 ${task.category}`;

        const repeatBadge = document.createElement('span');
        repeatBadge.className = 'repeat-badge';
        repeatBadge.style.marginEnd = '6px';
        repeatBadge.textContent = `🔁 ${task.repeat}`;
        
        const dateSpan = document.createElement('span');
        dateSpan.textContent = task.datetime ? `⏰ ${task.datetime.replace('T', ' ')}` : '';

        detailsDiv.appendChild(badge);
        if (task.repeat && task.repeat !== 'None' && task.repeat !== 'بدون تكرار') {
            detailsDiv.appendChild(repeatBadge);
        }
        detailsDiv.appendChild(dateSpan);

        taskInfo.appendChild(titleSpan);
        taskInfo.appendChild(detailsDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '6px';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.style.cssText = 'background:transparent; border:none; color:var(--primary-color); cursor:pointer; font-weight:bold; font-size:12px;';
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
        deleteBtn.style.cssText = 'background:transparent; border:none; color:var(--danger-color); cursor:pointer; font-weight:bold; font-size:12px;';
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

    if (statsText) statsText.textContent = `المكتملة: ${completedCount} / ${totalTasks}`;
    if (scoreText) scoreText.textContent = `النقاط: ${score} ⭐`;
    if (streakText) streakText.textContent = `🔥 ${streak} يوم`;
    if (progressBar) {
        const progressPercent = totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }
}

// ==========================================
// 7. إضافة وتحديث المهام والتنبيهات
// ==========================================
function addTask() {
    const text = taskInput.value.trim();
    const category = categorySelect ? categorySelect.value : 'General';
    const repeat = repeatSelect ? repeatSelect.value : 'None';
    const datetime = dateTimeInput ? dateTimeInput.value : '';

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
        if (addBtn) addBtn.textContent = 'إضافة مهمة جديدة';
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
    if (dateTimeInput) dateTimeInput.value = '';
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
                triggerLiveBot('bad');
                showToast(`⏰ حان موعد المهمة: "${task.text}"`, '#ef4444');
            }
        }
    });

    if (needsUpdate) saveAndRender();
}, 1000);

// ==========================================
// 8. مؤقت البومودورو (Pomodoro)
// ==========================================
function updateTimerDisplay() {
    if (!pomoTimer) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    pomoTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

if (pomoStart) {
    pomoStart.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            pomoStart.textContent = 'إيقاف مؤقت';
            pomoInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(pomoInterval);
                    playSound('complete');
                    score += 30;
                    triggerLiveBot('good');
                    showToast('🎉 انتهت جلسة التركيز! +30 نقطة');
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
}

if (pomoReset) {
    pomoReset.addEventListener('click', () => {
        clearInterval(pomoInterval);
        isRunning = false;
        timeLeft = 1500;
        updateTimerDisplay();
        if (pomoStart) pomoStart.textContent = 'بدء التركيز';
    });
}

// ==========================================
// 9. نظام التحديات 1v1 والبحث الذكي تلقائياً
// ==========================================
function renderDuelRequests() {
    if (!duelRequestsList) return;
    duelRequestsList.innerHTML = '';

    if (myDuelRequests.length === 0) {
        duelRequestsList.innerHTML = '<li style="font-size:12px; opacity:0.7; text-align:center; padding:10px;">لا توجد طلبات تحدي حالياً.</li>';
        return;
    }

    myDuelRequests.forEach((req, idx) => {
        const li = document.createElement('li');
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--input-bg); margin-bottom:6px; border-radius:8px; font-size:12px; border:1px solid var(--border-color);";
        li.innerHTML = `
            <span>⚔️ <strong>${req.sender}</strong> يتحدى قدراتك لمدة 30 يوماً!</span>
            <div style="display:flex; gap:5px;">
                <button class="pomo-btn" style="background:var(--accent-color); padding:3px 8px;" onclick="acceptDuel('${req.sender}')">قبول</button>
                <button class="pomo-btn" style="background:var(--danger-color); padding:3px 8px;" onclick="rejectDuel(${idx})">رفض</button>
            </div>
        `;
        duelRequestsList.appendChild(li);
    });
}

window.acceptDuel = function(senderName) {
    showToast(`قبِلت التحدي ضد ${senderName}! بدأت المعركة ⚔️`);
    activeDuels.push({ opponent: senderName, startTime: Date.now(), durationDays: 30 });
    localStorage.setItem('nexus_active_duels', JSON.stringify(activeDuels));
    myDuelRequests = myDuelRequests.filter(r => r.sender !== senderName);
    localStorage.setItem('nexus_duel_requests', JSON.stringify(myDuelRequests));
    renderDuelRequests();
};

window.rejectDuel = function(index) {
    myDuelRequests.splice(index, 1);
    localStorage.setItem('nexus_duel_requests', JSON.stringify(myDuelRequests));
    renderDuelRequests();
    showToast('تم رفض طلب التحدي.', '#ef4444');
};

if (openDuelModalBtn && duelModal) {
    openDuelModalBtn.addEventListener('click', () => {
        duelModal.classList.add('active');
        renderDuelRequests();
    });
}

if (closeDuelModal && duelModal) {
    closeDuelModal.addEventListener('click', () => duelModal.classList.remove('active'));
}

// قائمة الاقتراحات التلقائية عند كتابة اسم الصديق
if (targetFriendInput && friendAutocompleteList) {
    targetFriendInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        friendAutocompleteList.innerHTML = '';
        if (!val) {
            friendAutocompleteList.style.display = 'none';
            return;
        }

        const matches = leaderboardData.filter(u => u.name.toLowerCase().includes(val) && !u.me);
        if (matches.length > 0) {
            friendAutocompleteList.style.display = 'block';
            matches.forEach(m => {
                const cleanName = m.name.replace(' (أنت)', '');
                const li = document.createElement('li');
                li.className = 'autocomplete-item';
                li.textContent = cleanName;
                li.addEventListener('click', () => {
                    targetFriendInput.value = cleanName;
                    friendAutocompleteList.style.display = 'none';
                });
                friendAutocompleteList.appendChild(li);
            });
        } else {
            friendAutocompleteList.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== targetFriendInput) {
            friendAutocompleteList.style.display = 'none';
        }
    });
}

if (sendDuelRequestBtn && targetFriendInput) {
    sendDuelRequestBtn.addEventListener('click', () => {
        const friendName = targetFriendInput.value.trim();
        if (!friendName) {
            showToast('المرجو كتابة اسم الصديق بدقة!', '#f59e0b');
            return;
        }
        if (friendName === myNickname) {
            showToast('لا يمكنك تحدي نفسك!', '#ef4444');
            return;
        }

        showToast(`🚀 تم إرسال دعوة التحدي بنجاح إلى "${friendName}"!`);
        targetFriendInput.value = '';
        
        let existingRequests = JSON.parse(localStorage.getItem('nexus_duel_requests')) || [];
        existingRequests.push({ sender: myNickname });
        localStorage.setItem('nexus_duel_requests', JSON.stringify(existingRequests));
    });
}

// ==========================================
// 10. الاحداث والقوالب السريعة وتغيير اللغة
// ==========================================
if (templateChips) {
    templateChips.forEach(chip => {
        chip.addEventListener('click', () => {
            if (taskInput) {
                taskInput.value = chip.getAttribute('data-task');
                taskInput.focus();
            }
        });
    });
}

if (openGuideBtn && guideModal) {
    openGuideBtn.addEventListener('click', () => guideModal.classList.add('active'));
}

if (closeGuideBtn && guideModal) {
    closeGuideBtn.addEventListener('click', () => guideModal.classList.remove('active'));
}

window.addEventListener('click', (e) => {
    if (guideModal && e.target === guideModal) guideModal.classList.remove('active');
    if (duelModal && e.target === duelModal) duelModal.classList.remove('active');
});

if (addBtn) addBtn.addEventListener('click', addTask);
if (taskInput) {
    taskInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') addTask(); 
    });
}

if (searchBox) {
    searchBox.addEventListener('input', (e) => { 
        renderTasks(e.target.value); 
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTasks(searchBox ? searchBox.value : '');
    });
});

if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
        tasks = [];
        playSound('delete');
        showToast('تم مسح جميع المهام', '#ef4444');
        saveAndRender();
    });
}

if (themeToggle) {
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
}

// دعم التحويل التلقائي للغة (العربية والإنجليزية)
if (langSelect) {
    langSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        if (selectedLang === 'en') {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', 'en');
        } else {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        }
    });
}

// ==========================================
// 11. التشغيل الأولي للتطبيق عند الفتح
// ==========================================
renderTasks();
updateLeaderboard();
renderDuelRequests();