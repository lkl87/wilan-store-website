/* ============================================
   ويلان ستور - Wilan Store
   JavaScript للتفاعلات والحركات
============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ===== أصوات النقر (تُولَّد مباشرة بالمتصفح، بدون ملفات صوتية) =====
    let audioCtx = null;
    const getAudioCtx = () => {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        return audioCtx;
    };

    const playClickSound = (type = 'click') => {
        const ctx = getAudioCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (type === 'toggle') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(950, now + 0.15);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(680, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            osc.start(now);
            osc.stop(now + 0.07);
        }
    };

    // تفعيل الصوت على أي نقرة بزر أو رابط أو تبويب
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, a.btn, .service-card-btn, .tab-btn, .nav-menu a, .faq-question, .form-submit, .payment-option label, .copy-code-btn');
        if (target) playClickSound('click');
    });


    // ===== قائمة الموبايل =====
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // إغلاق القائمة عند الضغط على رابط
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = navToggle?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    // ===== شريط تقدّم التمرير =====
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgress.style.width = pct + '%';
        });
    }

    // ===== شريط التنقل عند التمرير =====
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ===== تأثير الظهور عند التمرير =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // ===== عدّاد الأرقام في الهيرو =====
    const stats = document.querySelectorAll('.hero-stat-num');
    const animateCount = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const update = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.floor(current).toLocaleString('en-US');
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toLocaleString('en-US');
            }
        };
        update();
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));

    // ===== تبويبات الخدمات =====
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === target) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // ===== اختيار فئة الشحن وإرسال الطلب (شدات ببجي / جواهر فري فاير / حسابات فري فاير) =====
    const setupSelectableService = (optionsId, btnId, { mode, itemPrefix, whatsappNumber }) => {
        const optionsWrap = document.getElementById(optionsId);
        const orderBtn = document.getElementById(btnId);
        if (!optionsWrap || !orderBtn) return;

        const radios = optionsWrap.querySelectorAll('input[type="radio"]');
        const btnLabel = orderBtn.querySelector('span');
        const defaultLabel = mode === 'whatsapp' ? 'تواصل عبر واتساب' : 'اطلب الآن';

        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                optionsWrap.querySelectorAll('.uc-option').forEach(opt => opt.classList.remove('selected'));
                if (radio.checked) {
                    radio.closest('.uc-option').classList.add('selected');
                }
                orderBtn.disabled = false;
                if (btnLabel) btnLabel.textContent = defaultLabel;
            });
        });

        orderBtn.addEventListener('click', () => {
            const selected = optionsWrap.querySelector('input[type="radio"]:checked');
            if (!selected) return;

            const name = selected.getAttribute('data-name');
            const priceEl = selected.closest('.uc-option').querySelector('.uc-option-price');
            const price = priceEl ? priceEl.textContent.trim() : '';
            const fullName = `${itemPrefix} ${name}`;

            if (mode === 'whatsapp') {
                const message = `مرحباً، أريد شراء: ${fullName} — السعر: ${price}`;
                window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
            } else {
                openOrderModal(fullName, price);
            }
        });
    };

    setupSelectableService('pubgUcOptions', 'pubgUcOrderBtn', {
        mode: 'modal',
        itemPrefix: 'شدات ببجي'
    });

    setupSelectableService('freefireDiamondOptions', 'freefireDiamondOrderBtn', {
        mode: 'modal',
        itemPrefix: 'جواهر فري فاير'
    });

    setupSelectableService('freefireAccountOptions', 'freefireAccountOrderBtn', {
        mode: 'whatsapp',
        itemPrefix: 'حساب فري فاير',
        whatsappNumber: '963968246637'
    });

    // ===== FAQ =====
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ===== Modal فتح وإغلاق =====
    const modal = document.getElementById('orderModal');
    const modalClose = document.querySelector('.modal-close');

    window.openOrderModal = (serviceName, servicePrice) => {
        if (!modal) return;

        const titleEl = modal.querySelector('.modal h2');
        const subtitleEl = modal.querySelector('.modal-subtitle');
        const serviceField = modal.querySelector('#modalService');
        const priceField = modal.querySelector('#modalPrice');

        if (titleEl) {
            titleEl.textContent = serviceName ? `اطلب: ${serviceName}` : 'أكمل بيانات الطلب';
        }
        if (subtitleEl) {
            subtitleEl.innerHTML = servicePrice
                ? `<i class="fa-solid fa-tag"></i> السعر: <strong style="color: var(--primary-glow)">${servicePrice}</strong> — أكمل البيانات للتواصل`
                : 'عبّي البيانات وإحنا راح نتواصل معك فوراً';
        }
        if (serviceField) {
            serviceField.value = serviceName || '';
        }
        if (priceField) {
            priceField.value = servicePrice || '';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeOrderModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeOrderModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeOrderModal();
        });
    }

    // إغلاق بـ Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeOrderModal();
        }
    });

    // ===== معاينة صورة إشعار الدفع =====
    const receiptInput = document.getElementById('modalReceipt');
    const receiptPreview = document.getElementById('receiptPreview');
    const receiptPreviewImg = document.getElementById('receiptPreviewImg');

    if (receiptInput) {
        receiptInput.addEventListener('change', () => {
            const file = receiptInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    receiptPreviewImg.src = e.target.result;
                    receiptPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                receiptPreview.style.display = 'none';
            }
        });
    }

    // ===== نسخ كود التحويل (شام كاش) =====
    document.querySelectorAll('.copy-code-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-copy-target');
            const codeEl = document.getElementById(targetId);
            if (!codeEl) return;

            const text = codeEl.textContent.trim();

            const markCopied = () => {
                const icon = btn.querySelector('i');
                btn.classList.add('copied');
                if (icon) {
                    icon.classList.remove('fa-copy');
                    icon.classList.add('fa-check');
                }
                playClickSound('success');
                setTimeout(() => {
                    btn.classList.remove('copied');
                    if (icon) {
                        icon.classList.remove('fa-check');
                        icon.classList.add('fa-copy');
                    }
                }, 1500);
            };

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const tempInput = document.createElement('textarea');
                    tempInput.value = text;
                    tempInput.style.position = 'fixed';
                    tempInput.style.opacity = '0';
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                }
                markCopied();
            } catch (err) {
                console.warn('تعذر نسخ الكود تلقائياً، الرجاء نسخه يدوياً.');
            }
        });
    });

    // ===== إرسال الطلب إلى بوت تيليجرام =====
    const orderForm = document.getElementById('orderForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('orderSubmitBtn');
    const submitBtnText = document.getElementById('orderSubmitBtnText');

    const setStatus = (type, text) => {
        if (!formStatus) return;
        formStatus.className = `form-status show ${type}`;
        formStatus.innerHTML = text;
    };

    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const apiBase = window.WILAN_API_BASE || '';
            if (!apiBase) {
                setStatus('error', '<i class="fa-solid fa-circle-exclamation"></i> لم يتم ربط الموقع بالسيرفر بعد.');
                return;
            }

            const formData = new FormData(orderForm);

            submitBtn.disabled = true;
            submitBtnText.textContent = 'جاري الإرسال...';
            setStatus('loading', '<i class="fa-solid fa-spinner fa-spin"></i> جاري إرسال طلبك...');

            try {
                const res = await fetch(`${apiBase}/api/order`, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error('server_error');

                const result = await res.json();

                setStatus('success', `<i class="fa-solid fa-circle-check"></i> تم إرسال طلبك بنجاح! رقم الطلب #${result.orderId || ''} — سيتم مراجعته والتواصل معك قريباً.`);
                playClickSound('success');

                setTimeout(() => {
                    closeOrderModal();
                    orderForm.reset();
                    if (receiptPreview) receiptPreview.style.display = 'none';
                    formStatus.className = 'form-status';
                }, 2500);

            } catch (err) {
                setStatus('error', '<i class="fa-solid fa-circle-exclamation"></i> تعذر إرسال الطلب. تأكدي من اتصال الإنترنت وحاولي مرة أخرى.');
            } finally {
                submitBtn.disabled = false;
                submitBtnText.textContent = 'إرسال الطلب';
            }
        });
    }

    // ===== مزامنة الأسعار من السيرفر (يتحكم بها بوت تيليجرام) =====
    const syncPrices = async () => {
        const apiBase = window.WILAN_API_BASE || '';
        const priceEls = document.querySelectorAll('[data-price-id]');
        if (!apiBase || priceEls.length === 0) return;

        try {
            const res = await fetch(`${apiBase}/api/prices`);
            if (!res.ok) return;
            const prices = await res.json();

            priceEls.forEach(el => {
                const id = el.getAttribute('data-price-id');
                if (prices[id]) {
                    el.textContent = prices[id];
                }
            });
        } catch (err) {
            // إذا فشل الاتصال بالسيرفر، تبقى الأسعار الثابتة بالصفحة كما هي
            console.warn('تعذرت مزامنة الأسعار مع السيرفر، سيتم عرض الأسعار الافتراضية.');
        }
    };
    syncPrices();

    // ===== شريط العروض (يتحكم به بوت تيليجرام) =====
    const syncOfferBanner = async () => {
        const apiBase = window.WILAN_API_BASE || '';
        const banner = document.getElementById('offerBanner');
        const bannerText = document.getElementById('offerBannerText');
        if (!apiBase || !banner) return;

        try {
            const res = await fetch(`${apiBase}/api/offer`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.text && data.active) {
                bannerText.textContent = data.text;
                banner.style.display = 'flex';
            } else {
                banner.style.display = 'none';
            }
        } catch (err) {
            banner.style.display = 'none';
        }
    };
    syncOfferBanner();

    // ===== Smooth scroll للروابط =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== رسالة ترحيب في الكونسول =====
    console.log('%c🌟 ويلان ستور - Wilan Store 🌟', 'color: #00b3ff; font-size: 24px; font-weight: bold;');
    console.log('%cأهلاً فيك! متجركم للألعاب مبدع 🔥', 'color: #8aa0c7; font-size: 14px;');

    // ===== تحريك الفقاعات الزجاجية العائمة مع سرعة اللمس (كل فقاعة مستقلة) =====
    const glassBubbles = document.querySelectorAll('.glass-bubble');
    if (glassBubbles.length) {
        const bubbleStates = Array.from(glassBubbles).map((el, i) => ({
            el,
            offsetX: 0,
            offsetY: 0,
            responsiveness: 0.5 + (i % 5) * 0.18, // كل مربع يتفاعل بقوة مختلفة مع سرعة الحركة
            damping: 0.93 - (i % 4) * 0.035       // كل مربع يعود لمكانه بسرعة مختلفة (أثر التتبع الخلفي)
        }));

        let lastX = null;
        let lastY = null;
        const maxOffset = 70;

        const handleMove = (clientX, clientY) => {
            if (lastX === null) { lastX = clientX; lastY = clientY; return; }
            const dx = clientX - lastX;
            const dy = clientY - lastY;
            lastX = clientX;
            lastY = clientY;

            bubbleStates.forEach(state => {
                state.offsetX += dx * state.responsiveness;
                state.offsetY += dy * state.responsiveness;
            });
        };

        window.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                lastX = e.touches[0].clientX;
                lastY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 0) {
                handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', () => { lastX = null; lastY = null; });

        window.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });

        function animateBubbles() {
            bubbleStates.forEach(state => {
                state.offsetX = Math.max(-maxOffset, Math.min(maxOffset, state.offsetX));
                state.offsetY = Math.max(-maxOffset, Math.min(maxOffset, state.offsetY));
                state.el.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px)`;
                // تخميد تدريجي مختلف لكل مربع يعطي إحساس أنه يتبع اليد بتأخير
                state.offsetX *= state.damping;
                state.offsetY *= state.damping;
            });
            requestAnimationFrame(animateBubbles);
        }
        requestAnimationFrame(animateBubbles);
    }
});
