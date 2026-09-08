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

// عناصر نافذة الترحيب الأولى
const welcomeModal = document.getElementById('welcomeModal');
const welcomeNickname = document.getElementById('welcomeNickname');
const welcomeEmail = document.getElementById('welcomeEmail');
const startAppBtn = document.getElementById('startAppBtn');

// عناصر إضافية جديدة
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
let myNickname = localStorage.getItem('nexus_nickname') || '';
let myEmail = localStorage.getItem('nexus_email') || '';

// قاعدة بيانات المتصدرين العالمية الحقيقية (بدون أسماء وهمية مسبقة)
let leaderboardData = JSON.parse(localStorage.getItem('nexus_leaderboard')) || [];
// صندوق طلبات التحدي الواردة
let myDuelRequests = JSON.parse(localStorage.getItem('nexus_duel_requests')) || [];
// التحديات النشطة حالياً (تستمر 30 يوماً)
let activeDuels = JSON.parse(localStorage.getItem('nexus_active_duels')) || [];

// التحقق من التسجيل الأول (Onboarding Check)
if (myNickname) {
    if (welcomeModal) welcomeModal.style.display = 'none';
} else {
    if (welcomeModal) welcomeModal.style.display = 'flex';
}

// زر الدخول الأول بعد كتابة اللقب والإيميل
if (startAppBtn) {
    startAppBtn.addEventListener('click', () => {
        const nickname = welcomeNickname.value.trim();
        const email = welcomeEmail.value.trim();

        if (!nickname) {
            showToast('⚠️ المرجو إدخال اللقب لكي يظهر في لوحة المتصدرين!', '#f59e0b');
            return;
        }

        myNickname = nickname;
        localStorage.setItem('nexus_nickname', myNickname);

        if (email) {
            myEmail = email;
            localStorage.setItem('nexus_email', myEmail);
            // محاكاة إرسال إيميل ترحيب حقيقي عبر EmailJS (أو الخدمة المختارة)
            sendWelcomeEmail(myEmail, myNickname);
        }

        if (welcomeModal) welcomeModal.style.display = 'none';
        showToast(`أهلاً بك يا ${myNickname} في تطبيق Nexus Task! 🚀`);
        updateLeaderboard();
    });
}

// دالة إرسال الإيميل الترحيب باستخدام EmailJS
function sendWelcomeEmail(email, nickname) {
    // يمكنك استبدال هذه المعلومات ببيانات حسابك على EmailJS (Service ID, Template ID, Public Key)
    const templateParams = {
        to_email: email,
        to_name: nickname,
        message: 'مرحباً بك في تطبيق Nexus Task! نحن سعداء بانضمامك. استعد لتنظيم مهامك، رفع إنتاجيتك، والمنافسة بقوة في التحدي العالمي.'
    };

    // مثال اتصال بـ EmailJS (تأكد من تضمين مكتبة emailjs في الـ html إذا أردت تفعيلها مباشرة)
    if (typeof emailjs !== 'undefined') {
        emailjs.send('default_service', 'template_welcome', templateParams, 'YOUR_PUBLIC_KEY')
            .then(() => {
                showToast('📩 تم إرسال رسالة ترحيبية إلى بريدك الإلكتروني بنجاح!');
            }).catch(() => {});
    } else {
        console.log(`[Email Simulation] Welcome email sent to ${email} for user ${nickname}`);
    }
}

// البوت الحي للرسائل التحفيزية التلقائية بناءً على الحالة
function triggerLiveBot(type) {
    if (type === 'good') {
        const msgs = [
            `🤖 البوت: برافو عليك يا ${myNickname}! أداء رائع اليوم، استمر هكذا! 🔥`,
            `🤖 البوت: إنجاز ممتاز! مستواك في تصاعد مستمر نحو القمة 🚀`,
            `🤖 البوت: خطوة رائعة نحو أهدافك، أنت تبلي بلاءً حسناً اليوم! 🌟`
        ];
        showToast(msgs[Math.floor(Math.random() * msgs.length)], '#10b981');
    } else if (type === 'bad') {
        const msgs = [
            `🤖 البوت: انتبه يا ${myNickname}! مستواك في تراجع ومرّ وقت طويل بدون إنجاز ⚠️`,
            `🤖 البوت: التسويف ليس من شيم الأبطال! انهض وأنجز مهمة الآن لتستعيد نقاطك 💪`,
            `🤖 البوت: لقد لاحظنا خمولاً في مهامك، عُد بقوة ولا تستسلم الكسل! ⚡`
        ];
        showToast(msgs[Math.floor(Math.random() * msgs.length)], '#ef4444');
    }
}

// فحص دقيق لـ 24 ساعة للـ Streak والتدهور والبوست الحي
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

streakText.textContent = `🔥 ${streak} يوم`;
if(scoreText) scoreText.textContent = `النقاط: ${score} ⭐`;

function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem('nexus_score', JSON.stringify(score));
    localStorage.setItem('nexus_streak', JSON.stringify(streak));
    renderTasks(searchBox.value);
    updateLeaderboard();
}

// تحديث الترتيب العالمي الحقيقي الخالي من الأسماء الوهمية
function updateLeaderboard() {
    if (!myNickname) return;
    
    const myIndex = leaderboardData.findIndex(item => item.name.includes(myNickname) && item.me);
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
        if (leaderboardData.length === 0 || (leaderboardData.length === 1 && leaderboardData[0].me && leaderboardData[0].score === 50 && tasks.length === 0)) {
            leaderboardList.innerHTML = '<li style="font-size:12px; opacity:0.7; text-align:center; padding:10px;">لا توجد أسماء مسجلة بعد. كن أول المتصدرين!</li>';
            return;
        }

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
                    triggerLiveBot('bad');
                    showToast(`⚠️ فات موعد المهمة: "${task.text}"`, '#ef4444');
                }
            }
        }

        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';
        taskInfo.addEventListener('click', () => {
            tasks[originalIndex].completed = !tasks[originalIndex].completed;
            lastActiveTime = Date.now();
            localStorage.setItem('nexus_last_active', JSON.stringify(lastActiveTime));

            if (tasks[originalIndex].completed) {
                score += 20;
                streak += 1;
                playSound('complete');
                triggerLiveBot('good');
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
                triggerLiveBot('bad');
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

// إدارة واجهة تحدي الأصدقاء (1 vs 1) والطلبات الواردة
function renderDuelRequests() {
    if (!duelRequestsList) return;
    duelRequestsList.innerHTML = '';

    if (myDuelRequests.length === 0) {
        duelRequestsList.innerHTML = '<li style="font-size:12px; opacity:0.7; text-align:center; padding:10px; background:transparent;">لا توجد طلبات تحدي حالياً.</li>';
        return;
    }

    myDuelRequests.forEach((req, idx) => {
        const li = document.createElement('li');
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--input-bg); margin-bottom:6px; border-radius:8px; font-size:12px; border:1px solid var(--border-color);";
        li.innerHTML = `
            <span>⚔️ <strong>${req.sender}</strong> يتحداك لمدة 30 يوماً!</span>
            <div style="display:flex; gap:5px;">
                <button class="pomo-btn" style="background:#10b981; padding:3px 8px;" onclick="acceptDuel('${req.sender}')">قبول</button>
                <button class="pomo-btn" style="background:#ef4444; padding:3px 8px;" onclick="rejectDuel(${idx})">رفض</button>
            </div>
        `;
        duelRequestsList.appendChild(li);
    });
}

window.acceptDuel = function(senderName) {
    showToast(`لقد قبلت التحدي ضد ${senderName}! تبدأ معركة الـ 30 يوماً الآن ⚔️`);
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
    closeDuelModal.addEventListener('click', () => duelModal.classList.remove('active'));
}

// إرسال دعوة تحدي لصديق حقيقي في التطبيق
if (sendDuelRequestBtn && targetFriendInput) {
    sendDuelRequestBtn.addEventListener('click', () => {
        const friendName = targetFriendInput.value.trim();
        if (!friendName) {
            showToast('المرجو كتابة لقب الصديق بدقة!', '#f59e0b');
            return;
        }
        if (friendName === myNickname) {
            showToast('لا يمكنك تحدي نفسك!', '#ef4444');
            return;
        }

        // البحث في القائمة العالمية واكتشاف ما إذا كان الصديق مسجلاً حقاً
        const friendExists = leaderboardData.some(u => u.name.toLowerCase().includes(friendName.toLowerCase()));

        if (friendExists) {
            showToast(`🚀 تم إرسال دعوة التحدي بنجاح إلى "${friendName}"! انتظر قبوله.`);
            targetFriendInput.value = '';
            // محاكاة وصول الدعوة لطرف الصديق (أو حفظها في سجله)
            let existingRequests = JSON.parse(localStorage.getItem('nexus_duel_requests')) || [];
            existingRequests.push({ sender: myNickname });
            localStorage.setItem('nexus_duel_requests', JSON.stringify(existingRequests));
        } else {
            showToast(`⚠️ الصديق "${friendName}" غير موجود في التطبيق أو لم يقم بتسجيل لقبه بعد!`, '#ef4444');
        }
    });
}

// قوالب المهام السريعة
if(templateChips) {
    templateChips.forEach(chip => {
        chip.addEventListener('click', () => {
            taskInput.value = chip.getAttribute('data-task');
            categorySelect.value = 'Study';
            taskInput.focus();
        });
    });
}

if(openGuideBtn && guideModal) {
    openGuideBtn.addEventListener('click', () => guideModal.classList.add('active'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if(e.target === guideModal) guideModal.classList.remove('active');
        if(e.target === duelModal) duelModal.classList.remove('active');
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
renderDuelRequests();