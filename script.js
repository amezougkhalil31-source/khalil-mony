// ==========================================
// Nexus Task - Main Application Script (script.js)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. تحديد كافة عناصر الـ DOM (مع التحقق الآمن)
    // ==========================================
    const taskInput = document.getElementById('taskInput');
    const dateTimeInput = document.getElementById('dateTimeInput');
    const categorySelect = document.getElementById('categorySelect');
    const repeatSelect = document.getElementById('repeatSelect');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const mainAppLayout = document.getElementById('mainAppLayout');
    const statsText = document.getElementById('statsText');
    const scoreText = document.getElementById('scoreText');
    const levelText = document.getElementById('levelText');
    const progressBar = document.getElementById('progressBar');
    const themeToggle = document.getElementById('themeToggle');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const searchBox = document.getElementById('searchBox');
    const categoryFilter = document.getElementById('categoryFilter');
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

    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const openInboxBtn = document.getElementById('openInboxBtn');
    const inboxModal = document.getElementById('inboxModal');
    const closeInboxModal = document.getElementById('closeInboxModal');
    const viewMatchHistoryBtn = document.getElementById('viewMatchHistoryBtn');
    const matchHistoryModal = document.getElementById('matchHistoryModal');
    const closeMatchHistoryModal = document.getElementById('closeMatchHistoryModal');
    const historyList = document.getElementById('historyList');

    // عناصر الدليل التعليمي وقوالب المهام
    const openGuideBtn = document.getElementById('openGuideBtn');
    const closeGuideBtn = document.getElementById('closeGuideBtn');
    const guideModal = document.getElementById('guideModal');
    const templateChips = document.querySelectorAll('.template-chip');
    const leaderboardList = document.getElementById('leaderboardList');

    const columnSelectModal = document.getElementById('columnSelectModal');
    const closeColumnSelectModal = document.getElementById('closeColumnSelectModal');
    const confirmColumnBtn = document.getElementById('confirmColumnBtn');
    const countdownModal = document.getElementById('countdownModal');
    const activeDuelArenaModal = document.getElementById('activeDuelArenaModal');
    const closeArenaModal = document.getElementById('closeArenaModal');
    const forfeitDuelBtn = document.getElementById('forfeitDuelBtn');

    // عناصر تحدي الأصدقاء (1 vs 1)
    const openDuelModalBtn = document.getElementById('openDuelModalBtn');
    const closeDuelModal = document.getElementById('closeDuelModal');
    const duelModal = document.getElementById('duelModal');
    const targetFriendInput = document.getElementById('targetFriendInput');
    const sendDuelRequestBtn = document.getElementById('sendDuelRequestBtn');
    const duelRequestsList = document.getElementById('duelRequestsList');
    const autocompleteList = document.getElementById('autocompleteList');

    // عناصر مؤقت البومودورو
    const pomoTimer = document.getElementById('pomoTimer');
    const pomoStart = document.getElementById('pomoStart');
    const pomoReset = document.getElementById('pomoReset');

    // ==========================================
    // 2. المتغيرات العامة وحالة التطبيق (مع قراءة آمنة)
    // ==========================================
    let currentFilter = 'all';
    let currentCategoryFilter = 'all';
    let editIndex = null;
    let pomoInterval = null;
    let timeLeft = 1500; // 25 دقائق
    let isRunning = false;
    let selectedColumn = null;

    const STORAGE_KEY = 'nexus_tasks_master_db';

    function safeJSONParse(key, fallback) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    let tasks = safeJSONParse(STORAGE_KEY, []);
    let streak = Number(localStorage.getItem('nexus_streak')) || 0;
    let score = Number(localStorage.getItem('nexus_score')) || 50;
    let lastActiveTime = Number(localStorage.getItem('nexus_last_active')) || Date.now();
    let myNickname = localStorage.getItem('nexus_nickname') || '';
    let myEmail = localStorage.getItem('nexus_email') || '';
    let currentLang = localStorage.getItem('nexus_lang') || 'ar';

    let leaderboardData = safeJSONParse('nexus_leaderboard', []);
    let myDuelRequests = safeJSONParse('nexus_duel_requests', []);
    let activeDuels = safeJSONParse('nexus_active_duels', []);
    let matchHistory = safeJSONParse('nexus_match_history', []);
    let usedNicknames = safeJSONParse('nexus_used_nicknames', []);

    // ضبط المظهر الأولي
    const savedTheme = localStorage.getItem('nexus_theme') || 'light';
    if (body) body.setAttribute('data-theme', savedTheme);
    if (themeToggle) themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    // ==========================================
    // 3. دالة تنظيف النصوص لحماية التطبيق (XSS Prevention)
    // ==========================================
    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ==========================================
    // 4. قاموس النصوص ودعم اللغات (i18n)
    // ==========================================
    const translations = {
        ar: {
            addBtnDefault: "إضافة مهمة جديدة",
            addBtnUpdate: "تحديث المهمة",
            emptyError: "الرجاء كتابة اسم المهمة!",
            taskAdded: "تمت إضافة المهمة بنجاح!",
            taskUpdated: "تم تحديث المهمة بنجاح!",
            taskDeleted: "تم حذف المهمة",
            allCleared: "تم مسح جميع المهام",
            completeSuccess: "تم إنجاز المهمة بنجاح! +10 ⭐",
            expiredAlert: "⚠️ انتهاء موعد:",
            dueAlert: "⏰ حان موعد المهمة:",
            focusSessionEnd: "🎉 انتهت جلسة التركيز! +30 نقطة",
            startFocus: "بدء التركيز",
            pauseFocus: "إيقاف مؤقت",
            enterNicknameReq: "⚠️ المرجو إدخال اللقب للبدء والمنافسة في المتصدرين!",
            welcomeGreeting: "أهلاً بك يا {name} في Nexus Task! 🚀",
            welcomeEmailMsg: "📩 تم إرسال رسالة ترحيبية إلى بريدك الإلكتروني!",
            noLeaderboard: "لا يوجد متصدرين بعد.",
            noDuels: "لا توجد طلبات تحدي حالياً.",
            duelAccepted: "قبِلت التحدي ضد {name}! بدأت المعركة ⚔️",
            duelRejected: "تم رفض طلب التحدي.",
            invalidFriend: "المرجو كتابة اسم الصديق بدقة!",
            selfDuelError: "لا يمكنك تحدي نفسك!",
            duelSent: "🚀 تم إرسال دعوة التحدي بنجاح إلى {name}!",
            editBtn: "تعديل",
            deleteBtn: "حذف",
            completedText: "المكتملة",
            scoreText: "النقاط",
            levelText: "المستوى",
            you: "أنت"
        },
        en: {
            addBtnDefault: "Add New Task",
            addBtnUpdate: "Update Task",
            emptyError: "Please enter a task title!",
            taskAdded: "Task added successfully!",
            taskUpdated: "Task updated successfully!",
            taskDeleted: "Task deleted",
            allCleared: "All tasks cleared",
            completeSuccess: "Task completed! +10 ⭐",
            expiredAlert: "⚠️ Expired:",
            dueAlert: "⏰ Task Due:",
            focusSessionEnd: "🎉 Focus session finished! +30 points",
            startFocus: "Start Focus",
            pauseFocus: "Pause",
            enterNicknameReq: "⚠️ Please enter a nickname to compete on the leaderboard!",
            welcomeGreeting: "Welcome {name} to Nexus Task! 🚀",
            welcomeEmailMsg: "📩 Welcome email sent to your inbox!",
            noLeaderboard: "No leaderboard entries yet.",
            noDuels: "No duel requests currently.",
            duelAccepted: "Accepted duel against {name}! Battle started ⚔️",
            duelRejected: "Duel request rejected.",
            invalidFriend: "Please enter a valid friend nickname!",
            selfDuelError: "You cannot challenge yourself!",
            duelSent: "🚀 Duel invitation sent to {name}!",
            editBtn: "Edit",
            deleteBtn: "Delete",
            completedText: "Completed",
            scoreText: "Score",
            levelText: "Level",
            you: "You"
        },
        fr: {
            addBtnDefault: "Ajouter une tâche",
            addBtnUpdate: "Mettre à jour",
            emptyError: "Veuillez saisir le titre de la tâche!",
            taskAdded: "Tâche ajoutée avec succès!",
            taskUpdated: "Tâche mise à jour avec succès!",
            taskDeleted: "Tâche supprimée",
            allCleared: "Toutes les tâches ont été supprimées",
            completeSuccess: "Tâche terminée! +10 ⭐",
            expiredAlert: "⚠️ Expirée :",
            dueAlert: "⏰ Tâche à échéance :",
            focusSessionEnd: "🎉 Session de concentration terminée! +30 points",
            startFocus: "Commencer",
            pauseFocus: "Pause",
            enterNicknameReq: "⚠️ Veuillez saisir un surnom pour participer au classement!",
            welcomeGreeting: "Bienvenue {name} dans Nexus Task! 🚀",
            welcomeEmailMsg: "📩 Un email de bienvenue a été envoyé!",
            noLeaderboard: "Aucun classement pour le moment.",
            noDuels: "Aucune demande de duel pour le moment.",
            duelAccepted: "Vous avez accepté le duel contre {name}! Le combat a commencé ⚔️",
            duelRejected: "La demande de duel a été refusée.",
            invalidFriend: "Veuillez saisir un surnom valide!",
            selfDuelError: "Vous ne pouvez pas vous défier vous-même!",
            duelSent: "🚀 Invitation de duel envoyée à {name}!",
            editBtn: "Modifier",
            deleteBtn: "Supprimer",
            completedText: "Terminées",
            scoreText: "Points",
            levelText: "Niveau",
            you: "Vous"
        }
    };

    function t(key, params = {}) {
        let text = (translations[currentLang] && translations[currentLang][key]) || key;
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p]);
        });
        return text;
    }

    function normalizeNickname(value) {
        return String(value || '').trim().toLowerCase();
    }

    function syncUsedNicknames() {
        const namesFromLeaderboard = leaderboardData
            .map(item => {
                if (!item || !item.name) return '';
                return item.name.replace(/\s*\(.*?\)\s*$/, '').trim();
            })
            .filter(Boolean);

        const combined = [...new Set([...usedNicknames, ...namesFromLeaderboard])];
        usedNicknames = combined;
        localStorage.setItem('nexus_used_nicknames', JSON.stringify(combined));
    }

    function isNicknameTaken(candidateNick) {
        const normalizedCandidate = normalizeNickname(candidateNick);
        if (!normalizedCandidate) return false;

        syncUsedNicknames();

        return usedNicknames.some(name => normalizeNickname(name) === normalizedCandidate);
    }

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('nexus_lang', lang);
        if (document.documentElement) {
            document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
            document.documentElement.setAttribute('lang', lang);
        }

        if (addBtn) {
            addBtn.textContent = editIndex === null ? t('addBtnDefault') : t('addBtnUpdate');
        }

        if (pomoStart) {
            pomoStart.textContent = isRunning ? t('pauseFocus') : t('startFocus');
        }
        
        saveAndRender();
    }

    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }

    // ==========================================
    // 5. الصوتيات والمؤثرات البرمجية
    // ==========================================
    function playSound(type) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const audioCtx = new AudioCtx();
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
        } catch (e) {}
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
    // 6. إعدادات التسجيل الأول (Onboarding & Modal)
    // ==========================================
    function checkOnboarding() {
        const hasNickname = !!(myNickname && myNickname.trim() !== '');

        if (welcomeModal) {
            if (hasNickname) {
                welcomeModal.style.display = 'none';
                welcomeModal.style.visibility = 'hidden';
                welcomeModal.style.opacity = '0';
                welcomeModal.style.pointerEvents = 'none';
                welcomeModal.classList.remove('active');
            } else {
                welcomeModal.style.display = 'flex';
                welcomeModal.style.visibility = 'visible';
                welcomeModal.style.opacity = '1';
                welcomeModal.style.pointerEvents = 'auto';
                welcomeModal.classList.add('active');
            }
        }

        if (mainAppLayout) {
            mainAppLayout.style.display = hasNickname ? 'grid' : 'none';
        }

        if (body) body.style.overflow = hasNickname ? 'auto' : 'hidden';
    }

    function renderMatchHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';

        if (matchHistory.length === 0) {
            historyList.innerHTML = `<li style="font-size:12px; opacity:0.7; text-align:center; padding:10px;">${t('noLeaderboard')}</li>`;
            return;
        }

        matchHistory.forEach(entry => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div>
                    <strong>${escapeHTML(entry.title || 'Match')}</strong>
                    <div style="font-size:11px; opacity:0.75; margin-top:4px;">${escapeHTML(entry.date || '')}</div>
                </div>
                <span class="badge-${entry.result || 'draw'}">${escapeHTML(entry.resultLabel || entry.result || 'Draw')}</span>
            `;
            historyList.appendChild(li);
        });
    }

    if (startAppBtn) {
        startAppBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const nickname = welcomeNickname ? welcomeNickname.value.trim() : '';
            const email = welcomeEmail ? welcomeEmail.value.trim() : '';

            if (!nickname) {
                showToast(t('enterNicknameReq'), '#f59e0b');
                return;
            }

            if (isNicknameTaken(nickname) && normalizeNickname(nickname) !== normalizeNickname(myNickname)) {
                showToast(currentLang === 'en' ? `The nickname "${nickname}" is already used.` : `هذا اللقب "${nickname}" مستخدم بالفعل.`, '#ef4444');
                return;
            }

            myNickname = nickname;
            localStorage.setItem('nexus_nickname', myNickname);
            syncUsedNicknames();
            if (!usedNicknames.includes(myNickname)) {
                usedNicknames.push(myNickname);
                localStorage.setItem('nexus_used_nicknames', JSON.stringify(usedNicknames));
            }

            if (email) {
                myEmail = email;
                localStorage.setItem('nexus_email', myEmail);
                sendWelcomeEmail(myEmail, myNickname);
            }

            if (welcomeModal) {
                welcomeModal.style.display = 'none';
                welcomeModal.style.visibility = 'hidden';
                welcomeModal.style.opacity = '0';
                welcomeModal.style.pointerEvents = 'none';
                welcomeModal.classList.remove('active');
            }
            if (mainAppLayout) {
                mainAppLayout.style.display = 'grid';
            }
            if (body) body.style.overflow = 'auto';

            showToast(t('welcomeGreeting', { name: myNickname }));
            updateLeaderboard();
        });
    }

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('active');
        });
    }

    if (cancelLogoutBtn && logoutModal) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.remove('active');
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            myNickname = '';
            myEmail = '';
            localStorage.removeItem('nexus_nickname');
            localStorage.removeItem('nexus_email');

            if (logoutModal) logoutModal.classList.remove('active');
            checkOnboarding();
            renderTasks(searchBox ? searchBox.value : '');
            updateLeaderboard();
            showToast(currentLang === 'en' ? 'Logged out successfully' : 'تم تسجيل الخروج بنجاح', '#64748b');
        });
    }

    if (openInboxBtn && inboxModal) {
        openInboxBtn.addEventListener('click', () => {
            renderDuelRequests();
            inboxModal.classList.add('active');
        });
    }

    if (closeInboxModal && inboxModal) {
        closeInboxModal.addEventListener('click', () => {
            inboxModal.classList.remove('active');
        });
    }

    if (viewMatchHistoryBtn && matchHistoryModal) {
        viewMatchHistoryBtn.addEventListener('click', () => {
            renderMatchHistory();
            matchHistoryModal.classList.add('active');
        });
    }

    if (closeMatchHistoryModal && matchHistoryModal) {
        closeMatchHistoryModal.addEventListener('click', () => {
            matchHistoryModal.classList.remove('active');
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
                .then(() => { showToast(t('welcomeEmailMsg')); })
                .catch(() => {});
        }
    }

    // ==========================================
    // 7. نظام التحفيز والتدهور اليومي (Streak)
    // ==========================================
    function triggerLiveBot(type) {
        if (type === 'good') {
            const msgs = currentLang === 'en' ? [
                `🤖 Bot: Great job ${myNickname}! Keep it up! 🔥`,
                `🤖 Bot: Excellent score increase! You're rising up 🚀`,
                `🤖 Bot: Fantastic progress towards your goals! 🌟`
            ] : [
                `🤖 البوت: برافو عليك يا ${myNickname}! أداء رائع، استمر هكذا! 🔥`,
                `🤖 البوت: إنجاز ممتاز! مستواك في تصاعد مستمر نحو القمة 🚀`,
                `🤖 البوت: خطوة رائعة نحو أهدافك اليوم! 🌟`
            ];
            showToast(msgs[Math.floor(Math.random() * msgs.length)], '#10b981');
        } else if (type === 'bad') {
            const msgs = currentLang === 'en' ? [
                `🤖 Bot: Pay attention ${myNickname}! Hours pass with no progress ⚠️`,
                `🤖 Bot: Procrastination reduces score! Finish a task now 💪`,
                `🤖 Bot: Come back strong and don't break your streak! ⚡`
            ] : [
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
            localStorage.setItem('nexus_last_active', String(lastActiveTime));
            saveAndRender();
        }
    }
    setInterval(checkDailyStreakAndDeterioration, 60000);

    // ==========================================
    // 8. الحفظ وعرض المهام ومتصدرين العالم
    // ==========================================
    function saveAndRender() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem('nexus_score', String(score));
        localStorage.setItem('nexus_streak', String(streak));
        renderTasks(searchBox ? searchBox.value : '');
        updateLeaderboard();
    }

    function calculateLevel(xp) {
        return Math.floor(xp / 100) + 1;
    }

    function updateLeaderboard() {
        if (!myNickname) return;

        leaderboardData = safeJSONParse('nexus_leaderboard', []).map(item => ({
            ...item,
            likes: Number(item.likes) || 0,
            score: Number(item.score) || 0,
            me: !!item.me
        }));

        const labelYou = `(${t('you')})`;
        const myIndex = leaderboardData.findIndex(item => item.me || (item.name && item.name.toLowerCase().includes(myNickname.toLowerCase())));
        if (myIndex !== -1) {
            leaderboardData[myIndex].score = score;
            leaderboardData[myIndex].name = `${myNickname} ${labelYou}`;
            leaderboardData[myIndex].me = true;
        } else {
            leaderboardData.push({ name: `${myNickname} ${labelYou}`, score: score, me: true, likes: 0 });
        }

        leaderboardData = leaderboardData
            .map(item => ({
                ...item,
                likes: Number(item.likes) || 0,
                score: Number(item.score) || 0
            }))
            .filter(item => item.name && item.name.trim() !== '');

        leaderboardData.sort((a, b) => b.score - a.score);
        localStorage.setItem('nexus_leaderboard', JSON.stringify(leaderboardData));

        if (leaderboardList) {
            leaderboardList.innerHTML = '';
            if (leaderboardData.length === 0) {
                leaderboardList.innerHTML = `<li style="font-size:12px; opacity:0.7; text-align:center; padding:10px;">${t('noLeaderboard')}</li>`;
                return;
            }

            leaderboardData.forEach((user, index) => {
                const li = document.createElement('li');
                const cleanName = (user.name || '').replace(/\s*\(.*?\)\s*$/, '').trim();
                const likeLabel = user.me ? `<span style="font-size:11px; opacity:0.8;">❤️ ${user.likes}</span>` : `<button type="button" class="like-btn" data-user="${cleanName}" style="background:transparent; border:1px solid var(--border-color); border-radius:999px; padding:4px 8px; cursor:pointer; color:var(--primary-color); font-size:11px;">❤️ ${user.likes}</button>`;
                li.className = `leaderboard-item ${user.me ? 'me' : ''}`;
                li.innerHTML = `
                    <span>#${index + 1} ${escapeHTML(user.name)}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-weight:bold; color:var(--primary-color);">${user.score} ⭐</span>
                        ${likeLabel}
                    </div>
                `;
                leaderboardList.appendChild(li);
            });

            leaderboardList.querySelectorAll('.like-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const targetName = button.getAttribute('data-user');
                    if (!targetName || targetName === myNickname) return;

                    leaderboardData = leaderboardData.map(user => {
                        const currentName = (user.name || '').replace(/\s*\(.*?\)\s*$/, '').trim();
                        if (currentName === targetName) {
                            return { ...user, likes: (Number(user.likes) || 0) + 1 };
                        }
                        return user;
                    });

                    localStorage.setItem('nexus_leaderboard', JSON.stringify(leaderboardData));
                    updateLeaderboard();
                    showToast(currentLang === 'en' ? `You liked ${targetName}.` : `أعجبتك ${targetName}.`, '#10b981');
                });
            });
        }
    }

    function renderTasks(filterText = '') {
        if (!taskList) return;
        taskList.innerHTML = '';
        let completedCount = 0;
        const totalTasks = tasks.length;
        const now = new Date();

        tasks.forEach(task => { if (task.completed) completedCount++; });

        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.text ? task.text.toLowerCase().includes(filterText.toLowerCase()) : true;
            const matchesCategory = (currentCategoryFilter === 'all' || task.category === currentCategoryFilter);
            
            let matchesStatus = true;
            if (currentFilter === 'active') matchesStatus = !task.completed;
            if (currentFilter === 'completed') matchesStatus = task.completed;

            return matchesSearch && matchesCategory && matchesStatus;
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
                        showToast(`${t('expiredAlert')} "${task.text}"`, '#ef4444');
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
                localStorage.setItem('nexus_last_active', String(lastActiveTime));

                if (tasks[originalIndex].completed) {
                    score += 10;
                    streak += 1;
                    playSound('complete');
                    triggerLiveBot('good');
                    showToast(t('completeSuccess'));
                } else {
                    score = Math.max(0, score - 10);
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
            badge.textContent = `📁 ${task.category || 'General'}`;

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
            editBtn.textContent = t('editBtn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (taskInput) taskInput.value = task.text;
                if (categorySelect) categorySelect.value = task.category || 'General';
                if (repeatSelect) repeatSelect.value = task.repeat || 'None';
                if (dateTimeInput) dateTimeInput.value = task.datetime || '';
                editIndex = originalIndex;
                if (addBtn) addBtn.textContent = t('addBtnUpdate');
                if (taskInput) taskInput.focus();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.style.cssText = 'background:transparent; border:none; color:var(--danger-color); cursor:pointer; font-weight:bold; font-size:12px;';
            deleteBtn.textContent = t('deleteBtn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tasks.splice(originalIndex, 1);
                playSound('delete');
                showToast(t('taskDeleted'), '#ef4444');
                saveAndRender();
            });

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(taskInfo);
            li.appendChild(actionsDiv);
            taskList.appendChild(li);
        });

        if (statsText) statsText.textContent = `${t('completedText')}: ${completedCount} / ${totalTasks}`;
        if (scoreText) scoreText.textContent = `${t('scoreText')}: ${score} ⭐`;
        if (levelText) levelText.textContent = `${t('levelText')}: ${calculateLevel(score)} 🏅`;
        if (streakText) streakText.textContent = `🔥 ${streak} ${currentLang === 'en' ? 'Days' : 'يوم'}`;
        
        if (progressBar) {
            const progressPercent = totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100;
            progressBar.style.width = `${progressPercent}%`;
        }
    }

    // ==========================================
    // 9. إضافة وتحديث المهام والتنبيهات
    // ==========================================
    function addTask() {
        if (!taskInput) return;
        const text = taskInput.value.trim();
        const category = categorySelect ? categorySelect.value : 'General';
        const repeat = repeatSelect ? repeatSelect.value : 'None';
        const datetime = dateTimeInput ? dateTimeInput.value : '';

        if (text === '') {
            showToast(t('emptyError'), '#f59e0b');
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
            if (addBtn) addBtn.textContent = t('addBtnDefault');
            showToast(t('taskUpdated'));
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
            showToast(t('taskAdded'));
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
                    showToast(`${t('dueAlert')} "${task.text}"`, '#ef4444');
                }
            }
        });

        if (needsUpdate) saveAndRender();
    }, 1000);

    // ==========================================
    // 10. مؤقت البومودورو (Pomodoro)
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
                pomoStart.textContent = t('pauseFocus');
                pomoInterval = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateTimerDisplay();
                    } else {
                        clearInterval(pomoInterval);
                        pomoInterval = null;
                        playSound('complete');
                        score += 30;
                        triggerLiveBot('good');
                        showToast(t('focusSessionEnd'));
                        isRunning = false;
                        pomoStart.textContent = t('startFocus');
                        saveAndRender();
                    }
                }, 1000);
            } else {
                clearInterval(pomoInterval);
                pomoInterval = null;
                isRunning = false;
                pomoStart.textContent = t('startFocus');
            }
        });
    }

    if (pomoReset) {
        pomoReset.addEventListener('click', () => {
            if (pomoInterval) {
                clearInterval(pomoInterval);
                pomoInterval = null;
            }
            isRunning = false;
            timeLeft = 1500;
            updateTimerDisplay();
            if (pomoStart) pomoStart.textContent = t('startFocus');
        });
    }

    // ==========================================
    // 11. نظام التحديات 1v1 والبحث الذكي تلقائياً
    // ==========================================
    function renderDuelRequests() {
        if (!duelRequestsList) return;
        duelRequestsList.innerHTML = '';

        if (myDuelRequests.length === 0) {
            duelRequestsList.innerHTML = `<li style="font-size:12px; opacity:0.7; text-align:center; padding:10px;">${t('noDuels')}</li>`;
            return;
        }

        myDuelRequests.forEach((req, idx) => {
            const li = document.createElement('li');
            li.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--input-bg); margin-bottom:6px; border-radius:8px; font-size:12px; border:1px solid var(--border-color);";
            li.innerHTML = `
                <span>⚔️ <strong>${escapeHTML(req.sender)}</strong> ${currentLang === 'en' ? 'challenged you!' : 'يتحدى قدراتك لمدة 30 يوماً!'}</span>
                <div style="display:flex; gap:5px;">
                    <button class="pomo-btn accept-duel-btn" style="background:var(--accent-color); padding:3px 8px;" data-sender="${escapeHTML(req.sender)}">${currentLang === 'en' ? 'Accept' : 'قبول'}</button>
                    <button class="pomo-btn reject-duel-btn" style="background:var(--danger-color); padding:3px 8px;" data-index="${idx}">${currentLang === 'en' ? 'Decline' : 'رفض'}</button>
                </div>
            `;
            duelRequestsList.appendChild(li);
        });

        duelRequestsList.querySelectorAll('.accept-duel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const senderName = e.target.getAttribute('data-sender');
                acceptDuel(senderName);
            });
        });

        duelRequestsList.querySelectorAll('.reject-duel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'), 10);
                rejectDuel(index);
            });
        });
    }

    function acceptDuel(senderName) {
        showToast(t('duelAccepted', { name: senderName }));
        activeDuels.push({ opponent: senderName, startTime: Date.now(), durationDays: 30 });
        localStorage.setItem('nexus_active_duels', JSON.stringify(activeDuels));
        matchHistory.unshift({
            title: `${currentLang === 'en' ? 'Accepted duel against' : 'قبول تحدي ضد'} ${senderName}`,
            date: new Date().toLocaleString(currentLang === 'en' ? 'en-US' : 'ar-SA'),
            result: 'win',
            resultLabel: currentLang === 'en' ? 'Win' : 'فوز'
        });
        localStorage.setItem('nexus_match_history', JSON.stringify(matchHistory));
        myDuelRequests = myDuelRequests.filter(r => r.sender !== senderName);
        localStorage.setItem('nexus_duel_requests', JSON.stringify(myDuelRequests));
        renderDuelRequests();
    }

    function rejectDuel(index) {
        myDuelRequests.splice(index, 1);
        localStorage.setItem('nexus_duel_requests', JSON.stringify(myDuelRequests));
        renderDuelRequests();
        showToast(t('duelRejected'), '#ef4444');
    }

    if (openDuelModalBtn && duelModal) {
        openDuelModalBtn.addEventListener('click', () => {
            duelModal.classList.add('active');
            renderDuelRequests();
        });
    }

    if (closeDuelModal && duelModal) {
        closeDuelModal.addEventListener('click', () => duelModal.classList.remove('active'));
    }

    if (targetFriendInput && autocompleteList) {
        targetFriendInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            autocompleteList.innerHTML = '';
            if (!val) {
                autocompleteList.style.display = 'none';
                return;
            }

            const matches = leaderboardData.filter(u => u.name && u.name.toLowerCase().includes(val) && !u.me);
            if (matches.length > 0) {
                autocompleteList.style.display = 'block';
                matches.forEach(m => {
                    const cleanName = m.name.replace(` (${t('you')})`, '').replace(' (أنت)', '');
                    const li = document.createElement('li');
                    li.className = 'autocomplete-item';
                    li.textContent = cleanName;
                    li.addEventListener('click', () => {
                        targetFriendInput.value = cleanName;
                        autocompleteList.style.display = 'none';
                    });
                    autocompleteList.appendChild(li);
                });
            } else {
                autocompleteList.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target !== targetFriendInput) {
                autocompleteList.style.display = 'none';
            }
        });
    }

    if (sendDuelRequestBtn && targetFriendInput) {
        sendDuelRequestBtn.addEventListener('click', () => {
            const friendName = targetFriendInput.value.trim();
            if (!friendName) {
                showToast(t('invalidFriend'), '#f59e0b');
                return;
            }
            if (friendName === myNickname) {
                showToast(t('selfDuelError'), '#ef4444');
                return;
            }

            const existingRequests = safeJSONParse('nexus_duel_requests', []);
            const alreadyRequested = existingRequests.some(req => req.sender === myNickname && req.friend === friendName);

            if (alreadyRequested) {
                showToast(t('duelSent', { name: friendName }), '#f59e0b');
                targetFriendInput.value = '';
                return;
            }

            const newRequest = { sender: myNickname, friend: friendName };
            existingRequests.push(newRequest);
            myDuelRequests = existingRequests;
            localStorage.setItem('nexus_duel_requests', JSON.stringify(existingRequests));
            showToast(t('duelSent', { name: friendName }));
            targetFriendInput.value = '';
            if (duelRequestsList) renderDuelRequests();
        });
    }

    // ==========================================
    // 12. الأحداث والقوالب السريعة والفلترة
    // ==========================================
    if (templateChips) {
        templateChips.forEach(chip => {
            chip.addEventListener('click', () => {
                if (taskInput) {
                    const taskText = chip.getAttribute(`data-task-${currentLang}`) || chip.getAttribute('data-task-ar') || chip.textContent.trim();
                    taskInput.value = taskText;
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
        if (inboxModal && e.target === inboxModal) inboxModal.classList.remove('active');
        if (matchHistoryModal && e.target === matchHistoryModal) matchHistoryModal.classList.remove('active');
        if (logoutModal && e.target === logoutModal) logoutModal.classList.remove('active');
        if (columnSelectModal && e.target === columnSelectModal) columnSelectModal.classList.remove('active');
        if (countdownModal && e.target === countdownModal) countdownModal.classList.remove('active');
        if (activeDuelArenaModal && e.target === activeDuelArenaModal) activeDuelArenaModal.classList.remove('active');
    });

    if (addBtn) addBtn.addEventListener('click', addTask);
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') addTask(); 
        });
    }

    if(searchBox) {
        searchBox.addEventListener('input', (e) => { 
            renderTasks(e.target.value); 
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategoryFilter = e.target.value;
            renderTasks(searchBox ? searchBox.value : '');
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
            showToast(t('allCleared'), '#ef4444');
            saveAndRender();
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (body && body.getAttribute('data-theme') === 'light') {
                body.setAttribute('data-theme', 'dark');
                themeToggle.textContent = '☀️';
                localStorage.setItem('nexus_theme', 'dark');
            } else if (body) {
                body.setAttribute('data-theme', 'light');
                themeToggle.textContent = '🌙';
                localStorage.setItem('nexus_theme', 'light');
            }
        });
    }

    if (autocompleteList) {
        autocompleteList.style.display = 'none';
    }

    if (columnSelectModal) {
        const columnCards = document.querySelectorAll('.column-card');
        columnCards.forEach(card => {
            card.addEventListener('click', () => {
                selectedColumn = card.getAttribute('data-col');
                columnCards.forEach(item => item.classList.toggle('selected', item === card));
                if (confirmColumnBtn) confirmColumnBtn.disabled = !selectedColumn;
            });
        });

        if (closeColumnSelectModal) {
            closeColumnSelectModal.addEventListener('click', () => {
                columnSelectModal.classList.remove('active');
                selectedColumn = null;
                if (confirmColumnBtn) confirmColumnBtn.disabled = true;
            });
        }

        if (confirmColumnBtn) {
            confirmColumnBtn.addEventListener('click', () => {
                if (!selectedColumn) {
                    showToast(currentLang === 'en' ? 'Please choose a route first.' : 'المرجو اختيار المسار أولاً.', '#f59e0b');
                    return;
                }
                columnSelectModal.classList.remove('active');
                if (countdownModal) {
                    countdownModal.classList.add('active');
                }
                showToast(currentLang === 'en' ? `Route ${selectedColumn} confirmed.` : `تم تأكيد المسار ${selectedColumn}.`, '#10b981');
            });
        }
    }

    if (closeArenaModal && activeDuelArenaModal) {
        closeArenaModal.addEventListener('click', () => {
            activeDuelArenaModal.classList.remove('active');
        });
    }

    if (forfeitDuelBtn) {
        forfeitDuelBtn.addEventListener('click', () => {
            if (activeDuelArenaModal) activeDuelArenaModal.classList.remove('active');
            score = Math.max(0, score - 50);
            saveAndRender();
            showToast(currentLang === 'en' ? 'You forfeited the duel and lost 50 points.' : 'انسحبت من التحدي وفقدت 50 نقطة.', '#ef4444');
        });
    }

    // ==========================================
    // 13. التشغيل الأولي المباشر والتأكيدي
    // ==========================================
    applyLanguage(currentLang);
    checkOnboarding();
    checkDailyStreakAndDeterioration();
    renderDuelRequests();
});