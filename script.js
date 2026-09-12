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
    const p1ScoreDisplay = document.getElementById('p1ScoreDisplay');
    const p2ScoreDisplay = document.getElementById('p2ScoreDisplay');
    const arenaTimerDisplay = document.getElementById('arenaTimerDisplay');
    const activeTasksContainer = document.getElementById('activeTasksContainer');

    // عناصر تحدي الأصدقاء (1 vs 1)
    const openDuelModalBtn = document.getElementById('openDuelModalBtn');
    const openActiveDuelArenaBtn = document.getElementById('openActiveDuelArenaBtn');
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

    const DAY_MS = 24 * 60 * 60 * 1000;

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
    let likedProfiles = safeJSONParse('nexus_liked_profiles', []);

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
            resetFocus: "إعادة ضبط",
            enterNicknameReq: "⚠️ المرجو إدخال اللقب للبدء والمنافسة في المتصدرين!",
            welcomeGreeting: "أهلاً بك يا {name} في Nexus Task! 🚀",
            welcomeEmailMsg: "📩 تم إرسال رسالة ترحيبية إلى بريدك الإلكتروني!",
            noLeaderboard: "لا يوجد متصدرين بعد.",
            noDuels: "لا توجد طلبات تحدي حالياً.",
            duelAccepted: "قبِلت التحدي ضد {name}! بدأت المعركة ⚔️",
            duelRejected: "تم رفض طلب التحدي.",
            invalidFriend: "المرجو كتابة اسم الصديق بدقة!",
            invalidEmail: "البريد الإلكتروني غير صحيح. المرجو إدخال بريد إلكتروني صحيح.",
            nicknameTaken: "هذا اللقب \"{name}\" مستخدم بالفعل.",
            selfDuelError: "لا يمكنك تحدي نفسك!",
            duelSent: "🚀 تم إرسال دعوة التحدي بنجاح إلى {name}!",
            editBtn: "تعديل",
            deleteBtn: "حذف",
            completedText: "المكتملة",
            scoreText: "النقاط",
            levelText: "المستوى",
            you: "أنت",
            welcomeTitle: "🚀 مرحباً بك في تطبيق Nexus Task!",
            welcomeSubtitle: "المرجو إدخال اللقب والبريد الإلكتروني للإنضمام للائحة العالمية:",
            welcomeNicknamePlaceholder: "مثلاً: بطل البرمجة 💻",
            welcomeEmailPlaceholder: "البريد الإلكتروني (مثال: name@gmail.com)",
            welcomeHelpText: "💡 سيتم إرسال رابط/كود تأكيد للتأكد من وجود الإيميل فعلياً.",
            startAppBtnLabel: "دخول للتطبيق 🎯",
            quickReadyText: "جاهز:",
            quickWorkoutLabel: "رياضة",
            quickReadLabel: "قراءة",
            quickReviewLabel: "مراجعة",
            quickWaterLabel: "ماء",
            quickWorkLabel: "عمل",
            filterAll: "الكل",
            filterActive: "النشطة",
            filterCompleted: "المكتملة",
            searchBoxPlaceholder: "🔍 البحث في المهام...",
            taskInputPlaceholder: "ما هي المهمة التي تريد إنجازها؟",
            categoryWork: "💼 العمل",
            categoryStudy: "📚 الدراسة",
            categoryPersonal: "🎯 شخصي",
            repeatNone: "بدون تكرار",
            repeatDaily: "يومي",
            repeatWeekly: "أسبوعي",
            addTaskBtnLabel: "إضافة مهمة جديدة 🚀",
            footAbout: "من نحن",
            footPrivacy: "سياسة الخصوصية",
            footContact: "اتصل بنا",
            footBlog: "المدونة",
            lbTitle: "🌍 الترتيب العالمي",
            lbSub: "قائمة الأبطال الحقيقيين في التطبيق:",
            duelMainBtn: "⚔️ تحدي الأصدقاء (1V1)",
            activeDuelBtn: "⚔️ ساحة 1V1 النشطة",
            matchHistoryBtn: "📜 سجل المباريات (Match History)",
            duelModalTitle: "⚔️ غرفة تحدي الأصدقاء (30 يوماً)",
            duelRulesSummary: "📌 القواعد والرهان: دخول التحدي يتطلب 50 نقطة/نجمة على الأقل في رصيدك العالمي. يتم خصم 50 نقطة من الطرفين (المجموع = 100 نقطة). والفائز يحصد النقاط في النهاية.",
            targetFriendInputPlaceholder: "اكتب لقب الصديق بدقة...",
            sendDuelButton: "إرسال دعوة التحدي (اقتطاع 50 نقطة) 🎯",
            colSelectTitle: "🎯 اختر مسار التحدي الخاص بك",
            colSelectSub: "اختر شريط المهام الذي ستلتزم به طوال الـ 30 يوماً ضد منافسك:",
            col1Title: "📌 الشريط 1: مسار التركيز والإنتاجية (البومودورو)",
            col2Title: "📌 الشريط 2: مسار الانضباط والالتزام اليومي",
            col3Title: "📌 الشريط 3: مسار التحديات السريعة",
            col4Title: "📌 الشريط 4: مسار بناء العادات والتطوير الذاتي",
            col5Title: "📌 الشريط 5: المسار الشامل والمتنوع",
            col1Desc: "يحتوي على 8 مهام مخصصة لجلسات التركيز العميق وإدارة الوقت.",
            col2Desc: "يحتوي على 9 مهام تبني الانضباط الحديدي والاستيقاظ والالتزام.",
            col3Desc: "يحتوي على 7 مهام خاطفة وقوية لإنجازها في وقت قياسي.",
            col4Desc: "يحتوي على 10 مهام لترسيخ العادات الإيجابية والقراءة والرياضة.",
            col5Desc: "مزج متوازن لجميع أنواع المهام للياقة، العمل، والتطوير.",
            confirmColumnBtnLabel: "تأكيد اختيار المسار 🚀",
            waitingOpponentText: "⏳ في انتظار اختيار الخصم لمساره...",
            countdownSub: "استعد! التحدي على وشك البدء بمدة 30 يوماً!",
            arenaTitle: "⚔️ ساحة التحدي المباشر (30 يوماً)",
            dailyResetNotice: "🔄 يتم تفريغ علامات الإنجاز تلقائياً كل 24 ساعة للبدء في دورة جديدة مع احتفاظك بكامل نقاطك التراكمية!",
            forfeitDuelBtnLabel: "🏳️ الانسحاب من التحدي (خسارة 50 نقطة)",
            historyModalTitle: "📜 سجل المباريات الأرشيفي",
            inboxModalTitle: "📩 صندوق الطلبات والرسائل",
            guideTitle: "📖 دليل زيادة الإنتاجية وتنظيم الوقت",
            guideDesc1: "تطبيق Nexus Task هو أداة متكاملة صُممت لتنظيم وقتك والحد من التسويف عبر استراتيجيات عالمية:",
            guideTip1: "تقنية بومودورو:",
            guideTip1Text: "تقسيم العمل لجلسات تركيز 25 دقيقة لتجنب التشتت.",
            guideTip2: "الالتزام اليومي (Streak):",
            guideTip2Text: "أنجز ولو مهمة واحدة كل 24 ساعة لرفع نقاطك (+10 لكل مهمة).",
            inboxTitle: "الرسائل والطلبات",
            guideTitleBtn: "دليل الإنتاجية",
            themeTitle: "تغيير المظهر",
            logoutTitle: "تسجيل الخروج",
            confirmLogout: "نعم، خروج",
            cancelLogout: "إلغاء",
            logoutModalTitle: "🚪 تأكيد الخروج",
            logoutModalText: "هل أنت متأكد من أنك تريد الخروج من الحساب؟"
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
            resetFocus: "Reset",
            enterNicknameReq: "⚠️ Please enter a nickname to compete on the leaderboard!",
            welcomeGreeting: "Welcome {name} to Nexus Task! 🚀",
            welcomeEmailMsg: "📩 Welcome email sent to your inbox!",
            noLeaderboard: "No leaderboard entries yet.",
            noDuels: "No duel requests currently.",
            duelAccepted: "Accepted duel against {name}! Battle started ⚔️",
            duelRejected: "Duel request rejected.",
            invalidFriend: "Please enter a valid friend nickname!",
            invalidEmail: "The email address is invalid. Please enter a valid email.",
            nicknameTaken: "The nickname \"{name}\" is already used.",
            selfDuelError: "You cannot challenge yourself!",
            duelSent: "🚀 Duel invitation sent to {name}!",
            editBtn: "Edit",
            deleteBtn: "Delete",
            completedText: "Completed",
            scoreText: "Score",
            levelText: "Level",
            you: "You",
            welcomeTitle: "🚀 Welcome to Nexus Task!",
            welcomeSubtitle: "Please enter your nickname and email to join the global leaderboard:",
            welcomeNicknamePlaceholder: "For example: Coding Champion 💻",
            welcomeEmailPlaceholder: "Email address (example: name@gmail.com)",
            welcomeHelpText: "💡 A confirmation link/code will be sent to confirm your email is valid.",
            startAppBtnLabel: "Enter App 🎯",
            quickReadyText: "Ready:",
            quickWorkoutLabel: "Workout",
            quickReadLabel: "Read",
            quickReviewLabel: "Review",
            quickWaterLabel: "Water",
            quickWorkLabel: "Work",
            filterAll: "All",
            filterActive: "Active",
            filterCompleted: "Completed",
            searchBoxPlaceholder: "🔍 Search tasks...",
            taskInputPlaceholder: "What task would you like to complete?",
            categoryWork: "💼 Work",
            categoryStudy: "📚 Study",
            categoryPersonal: "🎯 Personal",
            repeatNone: "No repeat",
            repeatDaily: "Daily",
            repeatWeekly: "Weekly",
            addTaskBtnLabel: "Add New Task 🚀",
            footAbout: "About Us",
            footPrivacy: "Privacy Policy",
            footContact: "Contact",
            footBlog: "Blog",
            lbTitle: "🌍 Global Leaderboard",
            lbSub: "List of the real champions in the app:",
            duelMainBtn: "⚔️ Challenge a Friend (1V1)",
            activeDuelBtn: "⚔️ Active 1V1 Arena",
            matchHistoryBtn: "📜 Match History",
            duelModalTitle: "⚔️ Friend Challenge Room (30 Days)",
            duelRulesSummary: "📌 Rules and stakes: joining the challenge requires at least 50 points/stars in your global balance. 50 points are deducted from both players (total = 100 points). The winner claims the points in the end.",
            targetFriendInputPlaceholder: "Enter the friend's nickname precisely...",
            sendDuelButton: "Send duel invite (deduct 50 points) 🎯",
            colSelectTitle: "🎯 Choose Your Challenge Route",
            colSelectSub: "Choose the task track you will commit to for the next 30 days against your opponent:",
            col1Title: "📌 Route 1: Focus and Productivity Path (Pomodoro)",
            col2Title: "📌 Route 2: Daily Discipline and Commitment Path",
            col3Title: "📌 Route 3: Fast Challenges Path",
            col4Title: "📌 Route 4: Habit Building and Self-Development Path",
            col5Title: "📌 Route 5: Full and Varied Path",
            col1Desc: "Contains 8 tasks for deep focus and time management sessions.",
            col2Desc: "Contains 9 tasks that build iron discipline, waking up on time, and commitment.",
            col3Desc: "Contains 7 quick but powerful challenges to complete in record time.",
            col4Desc: "Contains 10 tasks to build positive habits, reading, and exercise.",
            col5Desc: "Balanced mix of fitness, work, and personal growth tasks.",
            confirmColumnBtnLabel: "Confirm Route 🚀",
            waitingOpponentText: "⏳ Waiting for your opponent to choose a route...",
            countdownSub: "Get ready! The challenge is about to begin for 30 days!",
            arenaTitle: "⚔️ Live Duel Arena (30 Days)",
            dailyResetNotice: "🔄 Completed marks are automatically reset every 24 hours to start a new cycle while keeping your accumulated points.",
            forfeitDuelBtnLabel: "🏳️ Forfeit Duel (lose 50 points)",
            historyModalTitle: "📜 Match History Archive",
            inboxModalTitle: "📩 Incoming Requests & Messages",
            guideTitle: "📖 Productivity & Time Management Guide",
            guideDesc1: "Nexus Task is an integrated tool designed to organize your time and reduce procrastination through global strategies:",
            guideTip1: "Pomodoro Technique:",
            guideTip1Text: "Split your work into 25-minute focused sessions to avoid distraction.",
            guideTip2: "Daily Commitment (Streak):",
            guideTip2Text: "Complete at least one task every 24 hours to raise your score (+10 per task).",
            inboxTitle: "Messages & Requests",
            guideTitleBtn: "Productivity Guide",
            themeTitle: "Change theme",
            logoutTitle: "Log out",
            confirmLogout: "Yes, log out",
            cancelLogout: "Cancel",
            logoutModalTitle: "🚪 Log out confirmation",
            logoutModalText: "Are you sure you want to log out?"
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
            resetFocus: "Réinitialiser",
            enterNicknameReq: "⚠️ Veuillez saisir un surnom pour participer au classement!",
            welcomeGreeting: "Bienvenue {name} dans Nexus Task! 🚀",
            welcomeEmailMsg: "📩 Un email de bienvenue a été envoyé!",
            noLeaderboard: "Aucun classement pour le moment.",
            noDuels: "Aucune demande de duel pour le moment.",
            duelAccepted: "Vous avez accepté le duel contre {name}! Le combat a commencé ⚔️",
            duelRejected: "La demande de duel a été refusée.",
            invalidFriend: "Veuillez saisir un surnom valide!",
            invalidEmail: "L'adresse e-mail est invalide. Veuillez saisir une adresse e-mail valide.",
            nicknameTaken: "Le surnom \"{name}\" est déjà utilisé.",
            selfDuelError: "Vous ne pouvez pas vous défier vous-même!",
            duelSent: "🚀 Invitation de duel envoyée à {name}!",
            editBtn: "Modifier",
            deleteBtn: "Supprimer",
            completedText: "Terminées",
            scoreText: "Points",
            levelText: "Niveau",
            you: "Vous",
            welcomeTitle: "🚀 Bienvenue dans Nexus Task!",
            welcomeSubtitle: "Veuillez saisir votre surnom et votre email pour rejoindre le classement global :",
            welcomeNicknamePlaceholder: "Par exemple : Champion du code 💻",
            welcomeEmailPlaceholder: "Adresse email (exemple : nom@gmail.com)",
            welcomeHelpText: "💡 Un lien/code de confirmation sera envoyé pour vérifier que l'email est valide.",
            startAppBtnLabel: "Entrer dans l'application 🎯",
            quickReadyText: "Prêt :",
            quickWorkoutLabel: "Sport",
            quickReadLabel: "Lecture",
            quickReviewLabel: "Révision",
            quickWaterLabel: "Eau",
            quickWorkLabel: "Travail",
            filterAll: "Tous",
            filterActive: "Actives",
            filterCompleted: "Terminées",
            searchBoxPlaceholder: "🔍 Rechercher des tâches...",
            taskInputPlaceholder: "Quelle tâche souhaitez-vous accomplir ?",
            categoryWork: "💼 Travail",
            categoryStudy: "📚 Études",
            categoryPersonal: "🎯 Personnel",
            repeatNone: "Sans répétition",
            repeatDaily: "Quotidien",
            repeatWeekly: "Hebdomadaire",
            addTaskBtnLabel: "Ajouter une tâche 🚀",
            footAbout: "À propos",
            footPrivacy: "Politique de confidentialité",
            footContact: "Contact",
            footBlog: "Blog",
            lbTitle: "🌍 Classement mondial",
            lbSub: "Liste des vrais champions dans l'application :",
            duelMainBtn: "⚔️ Défi entre amis (1V1)",
            activeDuelBtn: "⚔️ Arena 1V1 active",
            matchHistoryBtn: "📜 Historique des matchs",
            duelModalTitle: "⚔️ Salle de défi entre amis (30 jours)",
            duelRulesSummary: "📌 Règles et enjeux : rejoindre le défi nécessite au moins 50 points/étoiles dans votre solde global. 50 points sont déduits des deux joueurs (total = 100 points). Le gagnant récupère les points à la fin.",
            targetFriendInputPlaceholder: "Saisissez précisément le surnom de l'ami...",
            sendDuelButton: "Envoyer l'invitation (déduire 50 points) 🎯",
            colSelectTitle: "🎯 Choisissez votre parcours de défi",
            colSelectSub: "Choisissez la piste de tâches que vous allez suivre pendant 30 jours contre votre adversaire :",
            col1Title: "📌 Parcours 1 : Concentration et productivité (Pomodoro)",
            col2Title: "📌 Parcours 2 : Discipline quotidienne et engagement",
            col3Title: "📌 Parcours 3 : Défis rapides",
            col4Title: "📌 Parcours 4 : Habitudes et développement personnel",
            col5Title: "📌 Parcours 5 : Parcours complet et varié",
            col1Desc: "Contient 8 tâches pour les sessions de concentration profonde et la gestion du temps.",
            col2Desc: "Contient 9 tâches qui développent la discipline, le réveil matinal et l'engagement.",
            col3Desc: "Contient 7 défis rapides et puissants à réaliser en un temps record.",
            col4Desc: "Contient 10 tâches pour renforcer les habitudes positives, la lecture et l'exercice.",
            col5Desc: "Mélange équilibré de fitness, travail et développement personnel.",
            confirmColumnBtnLabel: "Confirmer le parcours 🚀",
            waitingOpponentText: "⏳ En attente du choix du parcours de l'adversaire...",
            countdownSub: "Préparez-vous ! Le défi va commencer pour 30 jours !",
            arenaTitle: "⚔️ Arena de duel en direct (30 jours)",
            dailyResetNotice: "🔄 Les marques de réussite sont automatiquement réinitialisées toutes les 24 heures pour commencer un nouveau cycle tout en conservant vos points accumulés.",
            forfeitDuelBtnLabel: "🏳️ Abandonner le défi (perdre 50 points)",
            historyModalTitle: "📜 Historique des matchs",
            inboxModalTitle: "📩 Boîte de messages et demandes",
            guideTitle: "📖 Guide de productivité et de gestion du temps",
            guideDesc1: "Nexus Task est un outil intégré conçu pour organiser votre temps et réduire la procrastination grâce à des stratégies globales :",
            guideTip1: "Technique Pomodoro :",
            guideTip1Text: "Divisez votre travail en sessions de 25 minutes de concentration pour éviter les distractions.",
            guideTip2: "Engagement quotidien (Streak) :",
            guideTip2Text: "Terminez au moins une tâche chaque 24 heures pour augmenter votre score (+10 par tâche).",
            inboxTitle: "Messages & demandes",
            guideTitleBtn: "Guide de productivité",
            themeTitle: "Changer le thème",
            logoutTitle: "Se déconnecter",
            confirmLogout: "Oui, quitter",
            cancelLogout: "Annuler",
            logoutModalTitle: "🚪 Confirmation de déconnexion",
            logoutModalText: "Êtes-vous sûr de vouloir vous déconnecter ?"
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

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
    }

    function emailMatchesNickname(email, nickname) {
        const trimmedEmail = String(email || '').trim().toLowerCase();
        const trimmedNickname = normalizeNickname(nickname).replace(/[^a-z0-9]/g, '');

        if (!trimmedEmail || !trimmedNickname) return true;

        const emailLocalPart = trimmedEmail.split('@')[0].replace(/[^a-z0-9]/g, '');
        if (!emailLocalPart) return false;

        return emailLocalPart.includes(trimmedNickname) || trimmedNickname.includes(emailLocalPart);
    }

    function updateEmailVerificationNotice() {
        const notice = document.getElementById('emailVerifyNotice');
        if (!notice) return;

        const email = (welcomeEmail ? welcomeEmail.value.trim() : '').toLowerCase();
        const nickname = welcomeNickname ? welcomeNickname.value.trim() : '';

        if (!email) {
            notice.style.display = 'none';
            notice.textContent = '';
            return;
        }

        if (!isValidEmail(email)) {
            notice.style.display = 'block';
            notice.style.color = '#ef4444';
            notice.textContent = currentLang === 'en'
                ? '⚠️ Email format is invalid. Please check it.'
                : currentLang === 'fr'
                    ? '⚠️ Le format de l’e-mail est invalide. Vérifiez-le.'
                    : '⚠️ صيغة البريد الإلكتروني غير صحيحة. يرجى التحقق منها.';
            return;
        }

        if (!nickname) {
            notice.style.display = 'block';
            notice.style.color = '#d97706';
            notice.textContent = currentLang === 'en'
                ? 'ℹ️ Enter a nickname to verify the email match.'
                : currentLang === 'fr'
                    ? 'ℹ️ Saisissez un surnom pour vérifier la correspondance avec l’e-mail.'
                    : 'ℹ️ أدخل لقبًا للتحقق من تطابق البريد الإلكتروني.';
            return;
        }

        if (!emailMatchesNickname(email, nickname)) {
            notice.style.display = 'block';
            notice.style.color = '#ef4444';
            notice.textContent = currentLang === 'en'
                ? '⚠️ The email does not match the nickname. Please check it.'
                : currentLang === 'fr'
                    ? '⚠️ L’e-mail ne correspond pas au surnom. Vérifiez-le.'
                    : '⚠️ البريد الإلكتروني لا يتطابق مع اللقب. يرجى التحقق منه.';
            return;
        }

        notice.style.display = 'block';
        notice.style.color = '#059669';
        notice.textContent = currentLang === 'en'
            ? '✅ Email verified successfully.'
            : currentLang === 'fr'
                ? '✅ E-mail vérifié avec succès.'
                : '✅ تم التحقق من البريد الإلكتروني بنجاح.';
    }

    function syncLikedProfiles() {
        likedProfiles = [...new Set(likedProfiles
            .map(name => normalizeNickname(name))
            .filter(Boolean))];
        localStorage.setItem('nexus_liked_profiles', JSON.stringify(likedProfiles));
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

    function updateStaticTexts() {
        const textBindings = {
            welcTitle: 'welcomeTitle',
            welcSub: 'welcomeSubtitle',
            welcomeNickname: 'welcomeNicknamePlaceholder',
            welcomeEmail: 'welcomeEmailPlaceholder',
            welcHelp: 'welcomeHelpText',
            startAppBtn: 'startAppBtnLabel',
            quickReadyText: 'quickReadyText',
            filterAll: 'filterAll',
            filterActive: 'filterActive',
            filterCompleted: 'filterCompleted',
            taskInput: 'taskInputPlaceholder',
            searchBox: 'searchBoxPlaceholder',
            optWork: 'categoryWork',
            optStudy: 'categoryStudy',
            optPersonal: 'categoryPersonal',
            repNone: 'repeatNone',
            repDaily: 'repeatDaily',
            repWeekly: 'repeatWeekly',
            footAbout: 'footAbout',
            footPrivacy: 'footPrivacy',
            footContact: 'footContact',
            footBlog: 'footBlog',
            lbTitle: 'lbTitle',
            lbSub: 'lbSub',
            openDuelModalBtn: 'duelMainBtn',
            openActiveDuelArenaBtn: 'activeDuelBtn',
            viewMatchHistoryBtn: 'matchHistoryBtn',
            logoutModalTitle: 'logoutModalTitle',
            logoutModalText: 'logoutModalText',
            confirmLogoutBtn: 'confirmLogout',
            cancelLogoutBtn: 'cancelLogout',
            duelModalTitle: 'duelModalTitle',
            duelRulesSummary: 'duelRulesSummary',
            targetFriendInput: 'targetFriendInputPlaceholder',
            sendDuelRequestBtn: 'sendDuelButton',
            colSelectTitle: 'colSelectTitle',
            colSelectSub: 'colSelectSub',
            col1Title: 'col1Title',
            col2Title: 'col2Title',
            col3Title: 'col3Title',
            col4Title: 'col4Title',
            col5Title: 'col5Title',
            col1Desc: 'col1Desc',
            col2Desc: 'col2Desc',
            col3Desc: 'col3Desc',
            col4Desc: 'col4Desc',
            col5Desc: 'col5Desc',
            confirmColumnBtn: 'confirmColumnBtnLabel',
            waitingOpponentText: 'waitingOpponentText',
            countdownSub: 'countdownSub',
            arenaTitle: 'arenaTitle',
            dailyResetNotice: 'dailyResetNotice',
            forfeitDuelBtn: 'forfeitDuelBtnLabel',
            historyModalTitle: 'historyModalTitle',
            inboxModalTitle: 'inboxModalTitle',
            guideTitle: 'guideTitle',
            guideDesc1: 'guideDesc1',
            guideTip1: 'guideTip1',
            guideTip2: 'guideTip2',
            guideTip1Text: 'guideTip1Text',
            guideTip2Text: 'guideTip2Text'
        };

        Object.entries(textBindings).forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (!el) return;

            const value = t(key);

            if (id === 'welcomeNickname' || id === 'welcomeEmail' || id === 'taskInput' || id === 'targetFriendInput' || id === 'searchBox') {
                el.placeholder = value;
            } else if (el.tagName === 'BUTTON' || el.tagName === 'SPAN' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'P' || el.tagName === 'A' || el.tagName === 'LI') {
                el.textContent = value;
            }
        });

        const templateLabels = [
            ['tmpl1', 'quickWorkoutLabel'],
            ['tmpl2', 'quickReadLabel'],
            ['tmpl3', 'quickReviewLabel'],
            ['tmpl4', 'quickWaterLabel'],
            ['tmpl5', 'quickWorkLabel']
        ];

        templateLabels.forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (el) {
                const emoji = id === 'tmpl1' ? '🏃‍♂️ ' : id === 'tmpl2' ? '📚 ' : id === 'tmpl3' ? '📝 ' : id === 'tmpl4' ? '💧 ' : '💼 ';
                el.textContent = `${emoji}${t(key)}`;
            }
        });

        if (openInboxBtn) openInboxBtn.title = t('inboxTitle');
        if (openGuideBtn) openGuideBtn.title = t('guideTitleBtn');
        if (themeToggle) themeToggle.title = t('themeTitle');
        if (logoutBtn) logoutBtn.title = t('logoutTitle');

        if (addBtn) {
            addBtn.textContent = editIndex === null ? t('addBtnDefault') : t('addBtnUpdate');
        }

        if (pomoStart) {
            pomoStart.textContent = isRunning ? t('pauseFocus') : t('startFocus');
        }

        if (pomoReset) {
            pomoReset.textContent = t('resetFocus');
        }
    }

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('nexus_lang', lang);
        if (document.documentElement) {
            document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
            document.documentElement.setAttribute('lang', lang);
        }

        updateStaticTexts();
        updateEmailVerificationNotice();
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

    if (welcomeNickname) {
        welcomeNickname.addEventListener('input', updateEmailVerificationNotice);
    }

    if (welcomeEmail) {
        welcomeEmail.addEventListener('input', updateEmailVerificationNotice);
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

            if (email && !isValidEmail(email)) {
                showToast(t('invalidEmail'), '#ef4444');
                return;
            }

            if (email && !emailMatchesNickname(email, nickname)) {
                showToast(t('invalidEmail'), '#ef4444');
                return;
            }

            if (isNicknameTaken(nickname) && normalizeNickname(nickname) !== normalizeNickname(myNickname)) {
                showToast(t('nicknameTaken', { name: nickname }), '#ef4444');
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
        const elapsedDays = Math.floor((now - lastActiveTime) / DAY_MS);

        if (elapsedDays >= 1) {
            streak += elapsedDays;
            lastActiveTime = now;
            localStorage.setItem('nexus_last_active', String(lastActiveTime));
            localStorage.setItem('nexus_streak', String(streak));
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
        updateActiveDuelButton();
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

        syncLikedProfiles();
        const likedSet = new Set(likedProfiles);
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
                const normalizedTarget = normalizeNickname(cleanName);
                const alreadyLiked = !user.me && likedSet.has(normalizedTarget);
                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-default';
                const likeButton = user.me
                    ? `<span style="font-size:11px; opacity:0.8;">❤️ ${user.likes}</span>`
                    : `<button type="button" class="like-btn" data-user="${escapeHTML(cleanName)}" ${alreadyLiked ? 'disabled' : ''} style="background:${alreadyLiked ? 'rgba(16,185,129,0.12)' : 'transparent'}; border:1px solid var(--border-color); border-radius:999px; padding:4px 8px; cursor:${alreadyLiked ? 'default' : 'pointer'}; color:var(--primary-color); font-size:11px; opacity:${alreadyLiked ? 0.8 : 1};">❤️ ${user.likes}</button>`;

                li.className = `leaderboard-item ${user.me ? 'me' : ''} ${rankClass}`;
                li.innerHTML = `
                    <span>#${index + 1} ${escapeHTML(user.name)}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-weight:bold; color:var(--primary-color);">${user.score} ⭐</span>
                        ${likeButton}
                    </div>
                `;
                leaderboardList.appendChild(li);
            });

            leaderboardList.querySelectorAll('.like-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const targetName = button.getAttribute('data-user');
                    const normalizedTarget = normalizeNickname(targetName);

                    if (!targetName || normalizedTarget === normalizeNickname(myNickname)) return;

                    if (likedProfiles.some(profile => normalizeNickname(profile) === normalizedTarget)) {
                        showToast(currentLang === 'en' ? `You already liked ${targetName}.` : `سبق لك إعجابك بـ ${targetName}.`, '#f59e0b');
                        return;
                    }

                    leaderboardData = leaderboardData.map(user => {
                        const currentName = (user.name || '').replace(/\s*\(.*?\)\s*$/, '').trim();
                        if (normalizeNickname(currentName) === normalizedTarget) {
                            return { ...user, likes: (Number(user.likes) || 0) + 1 };
                        }
                        return user;
                    });

                    likedProfiles.push(normalizedTarget);
                    syncLikedProfiles();
                    localStorage.setItem('nexus_leaderboard', JSON.stringify(leaderboardData));
                    updateLeaderboard();
                    showToast(currentLang === 'en' ? `You liked ${targetName}.` : `أعجبتك ${targetName}.`, '#10b981');
                });
            });
        }
    }

    function updateActiveDuelButton() {
        if (openActiveDuelArenaBtn) {
            openActiveDuelArenaBtn.style.display = activeDuels.length > 0 ? 'block' : 'none';
        }
    }

    function openActiveDuelArena() {
        if (!activeDuelArenaModal || activeDuels.length === 0) return;

        const duel = activeDuels[activeDuels.length - 1];
        const opponent = duel?.opponent || 'Opponent';

        if (p1ScoreDisplay) {
            p1ScoreDisplay.textContent = `${currentLang === 'en' ? 'You' : 'أنت'}: ${score} ${currentLang === 'en' ? 'points' : 'نقطة'}`;
        }

        if (p2ScoreDisplay) {
            p2ScoreDisplay.textContent = `${opponent}: 0 ${currentLang === 'en' ? 'points' : 'نقطة'}`;
        }

        if (arenaTimerDisplay) {
            arenaTimerDisplay.textContent = `${currentLang === 'en' ? '⏱️ Remaining' : '⏱️ المتبقي'}: 30 ${currentLang === 'en' ? 'days' : 'يوم'} (${currentLang === 'en' ? 'Round' : 'الدورة'} 1/30)`;
        }

        if (activeTasksContainer) {
            activeTasksContainer.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div style="padding:10px; border-radius:10px; background:rgba(79,70,229,0.06); border:1px solid rgba(79,70,229,0.15);">
                        <strong style="display:block; margin-bottom:4px;">${escapeHTML(myNickname || 'You')}</strong>
                        <div style="font-size:12px; opacity:0.8;">${currentLang === 'en' ? 'Your current tasks are shown below.' : 'المهام الحالية لديك تظهر أدناه.'}</div>
                    </div>
                    <div style="padding:10px; border-radius:10px; background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.15);">
                        <strong style="display:block; margin-bottom:4px;">${escapeHTML(opponent)}</strong>
                        <div style="font-size:12px; opacity:0.8;">${currentLang === 'en' ? 'The duel started and the score is being tracked live.' : 'بدأ التحدي ويتم تتبع النتيجة مباشرة.'}</div>
                    </div>
                    <div style="font-size:12px; opacity:0.8; margin-top:4px;">${tasks.length > 0 ? tasks.map(task => `• ${escapeHTML(task.text)}`).join('<br>') : (currentLang === 'en' ? 'No task yet.' : 'لا توجد مهام بعد.')}</div>
                </div>
            `;
        }

        activeDuelArenaModal.classList.add('active');
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
                    playSound('complete');
                    triggerLiveBot('good');
                    showToast(t('completeSuccess'));
                } else {
                    score = Math.max(0, score - 10);
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
        updateActiveDuelButton();
        openActiveDuelArena();
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

    if (openActiveDuelArenaBtn) {
        openActiveDuelArenaBtn.addEventListener('click', () => {
            openActiveDuelArena();
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
            const duelToRemove = activeDuels[activeDuels.length - 1];
            const opponentName = duelToRemove?.opponent || 'Opponent';

            if (activeDuelArenaModal) activeDuelArenaModal.classList.remove('active');

            if (duelToRemove) {
                activeDuels = activeDuels.filter(duel => duel !== duelToRemove);
                localStorage.setItem('nexus_active_duels', JSON.stringify(activeDuels));
            }

            score = Math.max(0, score - 50);

            const normalizedOpponent = normalizeNickname(opponentName);
            const opponentEntryIndex = leaderboardData.findIndex(item => {
                const currentName = (item.name || '').replace(/\s*\(.*?\)\s*$/, '').trim();
                return normalizeNickname(currentName) === normalizedOpponent;
            });

            if (opponentEntryIndex !== -1) {
                leaderboardData[opponentEntryIndex].score = (Number(leaderboardData[opponentEntryIndex].score) || 0) + 50;
            } else {
                leaderboardData.push({ name: opponentName, score: 50, me: false, likes: 0 });
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
            updateActiveDuelButton();
            saveAndRender();
            showToast(currentLang === 'en' ? 'You forfeited the duel. The opponent wins 50 points.' : 'انسحبت من التحدي. الخصم يفوز بـ 50 نقطة.', '#ef4444');
        });
    }

    // ==========================================
    // 13. التشغيل الأولي المباشر والتأكيدي
    // ==========================================
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    document.addEventListener('gesturestart', (event) => {
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (event) => {
        if (event.touches && event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('wheel', (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('keydown', (event) => {
        const isZoomCombo = (event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '-' || event.key === '0' || event.key === '=');
        if (isZoomCombo) {
            event.preventDefault();
        }
    });

    applyLanguage(currentLang);
    checkOnboarding();
    checkDailyStreakAndDeterioration();
    renderDuelRequests();
    updateActiveDuelButton();
});