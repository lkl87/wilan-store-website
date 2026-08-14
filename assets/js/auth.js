/* ============================================================
   تسجيل الدخول عبر تيليجرام + الملف الشخصي (طلباتي)
   ملف مستقل — ضيفي وسم <script src="assets/js/auth.js" defer></script>
   قبل </body> بكل صفحات الموقع (index.html, services.html, ...)
   ============================================================ */
(function () {
    const API_BASE = window.WILAN_API_BASE;
    const TOKEN_KEY = 'wilan_auth_token';
    const USER_KEY = 'wilan_auth_user';

    function getToken() { return localStorage.getItem(TOKEN_KEY); }
    function getUser() {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    }
    function saveSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    // ===== ستايل خاص بالنافذتين (منضاف مرة وحدة بالصفحة) =====
    const style = document.createElement('style');
    style.textContent = `
        .wilan-auth-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,.75);
            display: none; align-items: center; justify-content: center;
            z-index: 9999; padding: 20px; backdrop-filter: blur(4px);
        }
        .wilan-auth-overlay.open { display: flex; }
        .wilan-auth-box {
            background: #16182a; border: 1px solid rgba(255,255,255,.08);
            border-radius: 18px; padding: 26px 22px; max-width: 380px; width: 100%;
            text-align: center; direction: rtl; font-family: inherit;
            box-shadow: 0 20px 60px rgba(0,0,0,.5);
            max-height: 85vh; overflow-y: auto;
        }
        .wilan-auth-box h3 { margin: 0 0 6px; color: #fff; font-size: 20px; }
        .wilan-auth-box p.sub { color: #9aa0b4; font-size: 13px; margin: 0 0 18px; }
        .wilan-auth-close {
            position: absolute; top: 14px; left: 14px; background: none; border: none;
            color: #9aa0b4; font-size: 20px; cursor: pointer;
        }
        .wilan-auth-box { position: relative; }
        .wilan-tg-widget-holder { display: flex; justify-content: center; margin: 14px 0 6px; }
        .wilan-guest-btn {
            display: block; margin: 14px auto 0; background: none; border: none;
            color: #7aa2ff; font-size: 13px; text-decoration: underline; cursor: pointer;
        }
        .wilan-profile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .wilan-profile-avatar {
            width: 56px; height: 56px; border-radius: 50%; object-fit: cover;
            border: 2px solid rgba(255,255,255,.15);
        }
        .wilan-profile-name { color: #fff; font-size: 16px; font-weight: 700; margin: 0; }
        .wilan-profile-username { color: #9aa0b4; font-size: 12.5px; margin: 2px 0 0; }
        .wilan-orders-list { text-align: right; margin-top: 10px; }
        .wilan-order-card {
            background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07);
            border-radius: 12px; padding: 12px 14px; margin-bottom: 10px;
        }
        .wilan-order-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .wilan-order-id { color: #fff; font-weight: 700; font-size: 14px; }
        .wilan-order-badge {
            font-size: 11.5px; padding: 3px 10px; border-radius: 20px; font-weight: 700;
        }
        .wilan-order-badge.pending { background: rgba(255,193,7,.15); color: #ffc107; }
        .wilan-order-badge.confirmed { background: rgba(40,199,111,.15); color: #28c76f; }
        .wilan-order-badge.rejected { background: rgba(255,71,87,.15); color: #ff4757; }
        .wilan-order-service { color: #dcdfec; font-size: 13.5px; margin: 2px 0; }
        .wilan-order-date { color: #6d7286; font-size: 11.5px; }
        .wilan-order-delete-note {
            color: #6d7286; font-size: 11px; margin-top: 6px; padding-top: 6px;
            border-top: 1px dashed rgba(255,255,255,.08); line-height: 1.6;
        }
        .wilan-empty-orders { color: #6d7286; font-size: 13.5px; padding: 20px 0; }
        .wilan-logout-btn {
            width: 100%; margin-top: 16px; padding: 11px; background: rgba(255,71,87,.12);
            color: #ff4757; border: 1px solid rgba(255,71,87,.25); border-radius: 10px;
            font-size: 14px; font-weight: 700; cursor: pointer;
        }
        .wilan-nav-avatar-btn {
            cursor: pointer; border: none; background: none; padding: 0;
            width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
        }
        .wilan-nav-avatar-btn img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    `;
    document.head.appendChild(style);

    // ===== نافذتين: تسجيل الدخول، والملف الشخصي =====
    const overlay = document.createElement('div');
    overlay.className = 'wilan-auth-overlay';
    overlay.innerHTML = `<div class="wilan-auth-box" id="wilanAuthBoxContent"></div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    function openModal() { overlay.classList.add('open'); }
    function closeModal() { overlay.classList.remove('open'); }

    function renderLoginBox() {
        const box = document.getElementById('wilanAuthBoxContent');
        box.innerHTML = `
            <button class="wilan-auth-close" onclick="window.__wilanAuthClose()">✕</button>
            <h3>تسجيل الدخول</h3>
            <p class="sub">سجل دخولك بحساب تيليجرام لمتابعة طلباتك وحالتها بأي وقت</p>
            <div class="wilan-tg-widget-holder" id="wilanTgWidgetHolder"></div>
            <button class="wilan-guest-btn" onclick="window.__wilanAuthClose()">أو تابع الشراء بدون تسجيل دخول</button>
        `;
        loadTelegramWidget();
    }

    let widgetLoaded = false;
    function loadTelegramWidget() {
        const holder = document.getElementById('wilanTgWidgetHolder');
        if (!holder) return;
        holder.innerHTML = '<p style="color:#6d7286;font-size:12px;">جاري التحميل...</p>';

        fetch(`${API_BASE}/api/bot-username`)
            .then(r => r.json())
            .then(data => {
                if (!data.username) throw new Error('no username');
                holder.innerHTML = '';
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://telegram.org/js/telegram-widget.js?22';
                script.setAttribute('data-telegram-login', data.username);
                script.setAttribute('data-size', 'large');
                script.setAttribute('data-radius', '10');
                script.setAttribute('data-onauth', 'window.__wilanTelegramAuth(user)');
                script.setAttribute('data-request-access', 'write');
                holder.appendChild(script);
            })
            .catch(() => {
                holder.innerHTML = '<p style="color:#ff4757;font-size:12px;">تعذر تحميل زر تيليجرام، حاولي لاحقاً</p>';
            });
    }

    window.__wilanTelegramAuth = function (tgUser) {
        fetch(`${API_BASE}/api/auth/telegram`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tgUser)
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    saveSession(data.token, data.user);
                    updateNavAvatar();
                    renderProfileBox();
                } else {
                    alert('تعذر تسجيل الدخول: ' + (data.error || 'خطأ غير معروف'));
                }
            })
            .catch(() => alert('تعذر الاتصال بالسيرفر لتسجيل الدخول'));
    };

    window.__wilanAuthClose = closeModal;

    const statusLabels = {
        pending: { text: 'بانتظار المراجعة', cls: 'pending' },
        confirmed: { text: 'تم التأكيد', cls: 'confirmed' },
        rejected: { text: 'تم الرفض', cls: 'rejected' }
    };

    function renderProfileBox() {
        const user = getUser();
        const box = document.getElementById('wilanAuthBoxContent');
        if (!user) { renderLoginBox(); return; }

        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'مستخدم تيليجرام';
        box.innerHTML = `
            <button class="wilan-auth-close" onclick="window.__wilanAuthClose()">✕</button>
            <div class="wilan-profile-header">
                <img class="wilan-profile-avatar" src="${user.photoUrl || 'assets/img/logo.jpg'}" alt="">
                <div>
                    <p class="wilan-profile-name">${fullName}</p>
                    <p class="wilan-profile-username">${user.username ? '@' + user.username : ''}</p>
                </div>
            </div>
            <div class="wilan-orders-list" id="wilanOrdersList">
                <p class="wilan-empty-orders">جاري تحميل طلباتك...</p>
            </div>
            <button class="wilan-logout-btn" onclick="window.__wilanLogout()">تسجيل الخروج</button>
        `;
        loadMyOrders();
    }

    function loadMyOrders() {
        const list = document.getElementById('wilanOrdersList');
        fetch(`${API_BASE}/api/my-orders`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then(r => r.json())
            .then(data => {
                if (!data.orders || data.orders.length === 0) {
                    list.innerHTML = '<p class="wilan-empty-orders">ما عندك طلبات لسا</p>';
                    return;
                }
                list.innerHTML = data.orders.map(o => {
                    const st = statusLabels[o.status] || statusLabels.pending;
                    const deleteDate = new Date(o.deleteAt).toLocaleDateString('ar-SY');
                    return `
                        <div class="wilan-order-card">
                            <div class="wilan-order-top">
                                <span class="wilan-order-id">#${o.id}</span>
                                <span class="wilan-order-badge ${st.cls}">${st.text}</span>
                            </div>
                            <p class="wilan-order-service">${escapeHtml(o.service)} — ${escapeHtml(o.price)}</p>
                            <p class="wilan-order-date">${o.createdAt}</p>
                            <p class="wilan-order-delete-note">🗑️ ${escapeHtml(o.deleteReason)}</p>
                        </div>
                    `;
                }).join('');
            })
            .catch(() => {
                list.innerHTML = '<p class="wilan-empty-orders">تعذر تحميل الطلبات، حاولي لاحقاً</p>';
            });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    window.__wilanLogout = function () {
        fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` }
        }).finally(() => {
            clearSession();
            updateNavAvatar();
            closeModal();
        });
    };

    // ===== تحديث شكل الدائرة (شعار المتجر ↔ صورة المستخدم) وربطها بالضغط =====
    function updateNavAvatar() {
        document.querySelectorAll('.nav-logo-icon').forEach(icon => {
            const user = getUser();
            if (user && user.photoUrl) {
                icon.innerHTML = `<img src="${user.photoUrl}" alt="${user.firstName || ''}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            } else {
                icon.innerHTML = `<img src="assets/img/logo.jpg" alt="متجر ويلان" class="brand-photo">`;
            }
        });
    }

    function bindNavClick() {
        document.querySelectorAll('.nav-logo-icon').forEach(icon => {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const user = getUser();
                if (user) renderProfileBox(); else renderLoginBox();
                openModal();
            });
            // نمنع رابط <a class="nav-logo"> من التنقل لما يكون الضغط على الأيقونة تحديداً
            const parentLink = icon.closest('a.nav-logo');
            if (parentLink) {
                icon.addEventListener('click', (e) => e.preventDefault());
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateNavAvatar();
        bindNavClick();
    });
})();
