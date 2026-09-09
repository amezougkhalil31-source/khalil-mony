document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. العناصر والتحكم بالـ DOM
    // ==========================================
    const welcomeModal = document.getElementById('welcomeModal');
    const welcomeNickname = document.getElementById('welcomeNickname');
    const welcomeEmail = document.getElementById('welcomeEmail');
    const startAppBtn = document.getElementById('startAppBtn');
    const welcomeForm = document.getElementById('welcomeForm');

    const taskInput = document.getElementById('taskInput');
    const dateTimeInput = document.getElementById('dateTimeInput');
    const categorySelect = document.getElementById('categorySelect');
    const repeatSelect = document.getElementById('repeatSelect');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const statsText = document.getElementById('statsText');
    const scoreText = document.getElementById('scoreText');
    const progressBar = document.getElementById('progressBar');
    const streakText = document.getElementById('streakText');
    const toast = document.getElementById('toast');
    const searchBox = document.getElementById('searchBox');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const themeToggle = document.getElementById('themeToggle');
    const langSelect = document.getElementById('langSelect');
    const leaderboardList = document.getElementById('leaderboardList');

    // النوافذ الإضافية
    const openGuideBtn = document.getElementById('openGuideBtn');
    const closeGuideBtn = document.getElementById('closeGuideBtn');
    const guideModal = document.getElementById('guideModal');

    const openInboxBtn = document.getElementById('openInboxBtn');
    const closeInboxModal = document.getElementById('closeInboxModal');
    const inboxModal = document.getElementById('inboxModal');

    const openDuelModalBtn = document.getElementById('openDuelModalBtn');
    const closeDuelModal = document.getElementById('closeDuelModal');
    const duelModal = document.getElementById('duelModal');

    // ==========================================
    // 2. حالة التطبيق والبيانات
    // ==========================================
    let tasks = JSON.parse(localStorage.getItem('nexus_tasks')) || [];
    let score = Number(localStorage.getItem('nexus_score')) || 50;
    let streak = Number(localStorage.getItem('nexus_streak')) || 0;
    let nickname = localStorage.getItem('nexus_nickname') || '';
    let email = localStorage.getItem('nexus_email') || '';
    let currentFilter = 'all';

    // ==========================================
    // 3. معالجة الدخول المباشر (Onboarding & Enter Key)
    // ==========================================
    function hideWelcomeModal() {
        if (welcomeModal) {
            welcomeModal.style.setProperty('display', 'none', 'important');
            welcomeModal.classList.remove('active');
        }
    }

    function showWelcomeModal() {
        if (welcomeModal) {
            welcomeModal.style.setProperty('display', 'flex', 'important');
            welcomeModal.classList.add('active');
        }
    }

    function checkUserStatus() {
        if (nickname && nickname.trim() !== '') {
            hideWelcomeModal();
        } else {
            showWelcomeModal();
        }
    }

    function handleAppLogin(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const enteredName = welcomeNickname ? welcomeNickname.value.trim() : '';
        const enteredEmail = welcomeEmail ? welcomeEmail.value.trim() : '';

        if (!enteredName) {
            showToast('⚠️ المرجو كتابة اللقب للبدء!', '#f59e0b');
            if (welcomeNickname) welcomeNickname.focus();
            return false;
        }

        // حفظ الاسم والبريد
        nickname = enteredName;
        email = enteredEmail;
        localStorage.setItem('nexus_nickname', nickname);
        if (email) localStorage.setItem('nexus_email', email);

        // إخفاء الشاشة فوراً
        hideWelcomeModal();

        // التحديث والإشعار
        showToast(`🚀 أهلاً بك يا ${nickname} في Nexus Task!`);
        updateLeaderboard();
        renderTasks();
        return false;
    }

    // ربط الزر والأحداث
    if (startAppBtn) {
        startAppBtn.addEventListener('click', handleAppLogin);
    }

    if (welcomeForm) {
        welcomeForm.addEventListener('submit', handleAppLogin);
    }

    [welcomeNickname, welcomeEmail].forEach(input => {
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAppLogin(e);
                }
            });
        }
    });

    // ==========================================
    // 4. وظائف الإشعارات وإدارة المهام
    // ==========================================
    function showToast(msg, bg = '#10b981') {
        if (!toast) return;
        toast.textContent = msg;
        toast.style.background = bg;
        toast.style.display = 'block';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.style.display = 'none';
        }, 3000);
    }

    function saveState() {
        localStorage.setItem('nexus_tasks', JSON.stringify(tasks));
        localStorage.setItem('nexus_score', String(score));
        localStorage.setItem('nexus_streak', String(streak));
        updateLeaderboard();
    }

    function updateLeaderboard() {
        if (!leaderboardList || !nickname) return;
        let leaderboard = JSON.parse(localStorage.getItem('nexus_lb')) || [];
        
        const idx = leaderboard.findIndex(u => u.name === nickname);
        if (idx !== -1) {
            leaderboard[idx].score = score;
        } else {
            leaderboard.push({ name: nickname, score: score });
        }

        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('nexus_lb', JSON.stringify(leaderboard));

        leaderboardList.innerHTML = '';
        leaderboard.forEach((item, i) => {
            const li = document.createElement('li');
            li.style.cssText = "display:flex; justify-content:space-between; padding:6px 10px; background:#f8fafc; margin-bottom:5px; border-radius:6px; font-size:12px;";
            li.innerHTML = `<span>#${i + 1} ${item.name} ${item.name === nickname ? '(أنت)' : ''}</span> <strong>${item.score} ⭐</strong>`;
            leaderboardList.appendChild(li);
        });
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        let completed = 0;

        const filtered = tasks.filter(t => {
            const query = searchBox ? searchBox.value.toLowerCase() : '';
            const matchesText = t.text.toLowerCase().includes(query);
            if (currentFilter === 'active') return matchesText && !t.completed;
            if (currentFilter === 'completed') return matchesText && t.completed;
            return matchesText;
        });

        filtered.forEach((t, i) => {
            if (t.completed) completed++;
            const li = document.createElement('li');
            li.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 12px; margin-bottom:8px; background:#fff; border:1px solid #e2e8f0; border-radius:8px;";
            if (t.completed) li.style.opacity = '0.6';

            li.innerHTML = `
                <div style="cursor:pointer; flex:1;" class="task-title-click">
                    <span style="${t.completed ? 'text-decoration:line-through;' : ''} font-weight:bold;">${t.text}</span>
                    <div style="font-size:10px; color:#64748b; margin-top:2px;">📁 ${t.category} | 🔁 ${t.repeat} ${t.datetime ? ' | ⏰ ' + t.datetime.replace('T', ' ') : ''}</div>
                </div>
                <button class="del-btn" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold;">حذف</button>
            `;

            li.querySelector('.task-title-click').addEventListener('click', () => {
                t.completed = !t.completed;
                if (t.completed) {
                    score += 20;
                    streak += 1;
                    showToast('🎉 إنجاز ممتاز! +20 نقطة');
                } else {
                    score = Math.max(0, score - 20);
                }
                saveState();
                renderTasks();
            });

            li.querySelector('.del-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                tasks.splice(i, 1);
                saveState();
                renderTasks();
                showToast('🗑️ تم حذف المهمة', '#ef4444');
            });

            taskList.appendChild(li);
        });

        if (statsText) statsText.textContent = `المكتملة: ${completed} / ${tasks.length}`;
        if (scoreText) scoreText.textContent = `النقاط: ${score} ⭐`;
        if (streakText) streakText.textContent = `🔥 ${streak} يوم`;
        if (progressBar) {
            const pct = tasks.length === 0 ? 0 : (completed / tasks.length) * 100;
            progressBar.style.width = `${pct}%`;
        }
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const val = taskInput ? taskInput.value.trim() : '';
            if (!val) {
                showToast('⚠️ اكتب اسم المهمة أولاً!', '#f59e0b');
                return;
            }
            tasks.push({
                text: val,
                category: categorySelect ? categorySelect.value : 'Personal',
                repeat: repeatSelect ? repeatSelect.value : 'None',
                datetime: dateTimeInput ? dateTimeInput.value : '',
                completed: false
            });
            taskInput.value = '';
            if (dateTimeInput) dateTimeInput.value = '';
            saveState();
            renderTasks();
            showToast('✅ تمت إضافة المهمة بنجاح!');
        });
    }

    if (taskInput) {
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addBtn.click();
        });
    }

    // القوالب السريعة
    document.querySelectorAll('.template-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (taskInput) {
                taskInput.value = chip.getAttribute('data-task-ar') || chip.textContent;
                taskInput.focus();
            }
        });
    });

    // الفلترة والبحث
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        });
    });

    if (searchBox) searchBox.addEventListener('input', renderTasks);

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            tasks = [];
            saveState();
            renderTasks();
            showToast('🗑️ تم مسح جميع المهام', '#ef4444');
        });
    }

    // المودالات
    if (openGuideBtn && guideModal) openGuideBtn.addEventListener('click', () => guideModal.classList.add('active'));
    if (closeGuideBtn && guideModal) closeGuideBtn.addEventListener('click', () => guideModal.classList.remove('active'));

    if (openInboxBtn && inboxModal) openInboxBtn.addEventListener('click', () => inboxModal.classList.add('active'));
    if (closeInboxModal && inboxModal) closeInboxModal.addEventListener('click', () => inboxModal.classList.remove('active'));

    if (openDuelModalBtn && duelModal) openDuelModalBtn.addEventListener('click', () => duelModal.classList.add('active'));
    if (closeDuelModal && duelModal) closeDuelModal.addEventListener('click', () => duelModal.classList.remove('active'));

    // ==========================================
    // 5. التشغيل والتحقق الأولي المباشر
    // ==========================================
    checkUserStatus();
    renderTasks();
    updateLeaderboard();
});