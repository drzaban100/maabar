// ===== State =====
let currentSeller = null;
let registeredPhone = '';
let generatedOTP = '';
let pendingProductImage = '';
let editingCatIndex = -1;
let pendingCatImage = null;
const ADMIN_PASSWORD_KEY = 'maabar-admin-password';
const CATEGORIES_KEY = 'maabar-categories';

// ===== دسته‌بندی‌ها =====
const DEFAULT_CATEGORIES = [
    { name: "پوشاک و مد", icon: "🧥", colors: ["#ff5f9e", "#ffc371"] },
    { name: "لوازم آرایشی", icon: "💄", colors: ["#f857a6", "#ff5858"] },
    { name: "آموزشگاه زبان", icon: "🎓", colors: ["#4facfe", "#00f2fe"] },
    { name: "کافه و رستوران", icon: "☕", colors: ["#f6d365", "#fda085"] },
    { name: "سالن زیبایی", icon: "💈", colors: ["#a18cd1", "#fbc2eb"] },
    { name: "دکوراسیون داخلی", icon: "🛋️", colors: ["#84fab0", "#8fd3f4"] },
    { name: "لوازم یدکی موبایل", icon: "📱", colors: ["#667eea", "#764ba2"] },
    { name: "تعمیرات و خدمات فنی", icon: "🛠️", colors: ["#f7971e", "#ffd200"] },
    { name: "سوپرمارکت و خواربار", icon: "🛒", colors: ["#56ab2f", "#a8e063"] },
    { name: "کتاب و لوازم تحریر", icon: "📚", colors: ["#ff8008", "#ffc837"] },
    { name: "ورزش و تناسب اندام", icon: "🏋️", colors: ["#11998e", "#38ef7d"] },
    { name: "سایر", icon: "🏪", colors: ["#6366f1", "#ec4899"] }
];

const CAT_IMAGES = {
    "پوشاک و مد": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=60",
    "لوازم آرایشی": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=60",
    "آموزشگاه زبان": "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=60",
    "کافه و رستوران": "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=60",
    "سالن زیبایی": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=60",
    "دکوراسیون داخلی": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=60",
    "لوازم یدکی موبایل": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=60",
    "تعمیرات و خدمات فنی": "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=60",
    "سوپرمارکت و خواربار": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=60",
    "کتاب و لوازم تحریر": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=60",
    "ورزش و تناسب اندام": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=60",
    "سایر": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=60"
};

const FALLBACK_PALETTE = [
    ["#6366f1", "#ec4899"], ["#f857a6", "#ff5858"], ["#4facfe", "#00f2fe"],
    ["#f6d365", "#fda085"], ["#84fab0", "#8fd3f4"], ["#a18cd1", "#fbc2eb"]
];

function getCategories() {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) { try { return JSON.parse(stored); } catch (e) {} }
    return DEFAULT_CATEGORIES.slice();
}
function saveCategories(list) { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list)); }
function catIcon(name) {
    const c = getCategories().find(function (c) { return c.name === name; });
    return c ? c.icon : '🏪';
}
function catColors(name) {
    const c = getCategories().find(function (x) { return x.name === name; });
    if (c && c.colors) return c.colors;
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
    return FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
}
function catImage(name) {
    const c = getCategories().find(function (x) { return x.name === name; });
    return (c && c.image) || CAT_IMAGES[name] || "";
}

// ===== استان‌ها =====
const IRAN_CITIES = {
    "تهران": ["تهران", "شهریار", "اسلامشهر", "ورامین", "پاکدشت", "ری", "دماوند", "قرچک"],
    "البرز": ["کرج", "فردیس", "نظرآباد", "هشتگرد", "اشتهارد"],
    "اصفهان": ["اصفهان", "کاشان", "نجف‌آباد", "خمینی‌شهر", "شاهین‌شهر", "فولادشهر"],
    "فارس": ["شیراز", "مرودشت", "جهرم", "کازرون", "لار", "فسا"],
    "خراسان رضوی": ["مشهد", "نیشابور", "سبزوار", "تربت‌حیدریه", "کاشمر", "قوچان"],
    "آذربایجان شرقی": ["تبریز", "مراغه", "مرند", "میانه", "اهر", "بناب"],
    "آذربایجان غربی": ["ارومیه", "خوی", "میاندوآب", "مهاباد", "بوکان", "سلماس"],
    "کرمان": ["کرمان", "سیرجان", "رفسنجان", "جیرفت", "بم", "زرند"],
    "خوزستان": ["اهواز", "دزفول", "آبادان", "خرمشهر", "بندر ماهشهر", "شوشتر"],
    "گیلان": ["رشت", "بندر انزلی", "لاهیجان", "لنگرود", "آستارا", "رودسر"],
    "مازندران": ["ساری", "بابل", "آمل", "قائم‌شهر", "نوشهر", "چالوس"],
    "قم": ["قم", "قنوات", "جعفریه"],
    "کرمانشاه": ["کرمانشاه", "اسلام‌آباد غرب", "سنقر", "کنگاور", "هرسین"],
    "کردستان": ["سنندج", "سقز", "مریوان", "بانه", "قروه", "کامیاران"],
    "همدان": ["همدان", "ملایر", "نهاوند", "اسدآباد", "بهار"],
    "مرکزی": ["اراک", "ساوه", "خمین", "محلات", "دلیجان"],
    "لرستان": ["خرم‌آباد", "بروجرد", "دورود", "کوهدشت", "الیگودرز"],
    "سیستان و بلوچستان": ["زاهدان", "زابل", "ایرانشهر", "چابهار", "سراوان"],
    "هرمزگان": ["بندرعباس", "قشم", "میناب", "بندر لنگه", "حاجی‌آباد"],
    "گلستان": ["گرگان", "گنبد کاووس", "علی‌آباد", "بندر ترکمن", "آق‌قلا"],
    "اردبیل": ["اردبیل", "پارس‌آباد", "مشگین‌شهر", "خلخال", "گرمی"],
    "زنجان": ["زنجان", "ابهر", "خرمدره", "قیدار", "طارم"],
    "قزوین": ["قزوین", "تاکستان", "آبیک", "بوئین‌زهرا", "الوند"],
    "سمنان": ["سمنان", "شاهرود", "دامغان", "گرمسار", "مهدی‌شهر"],
    "یزد": ["یزد", "میبد", "اردکان", "تفت", "بافق"],
    "بوشهر": ["بوشهر", "گناوه", "برازجان", "دیر", "کنگان"],
    "چهارمحال و بختیاری": ["شهرکرد", "بروجن", "فارسان", "لردگان"],
    "کهگیلویه و بویراحمد": ["یاسوج", "دهدشت", "دوگنبدان", "لیکک"],
    "ایلام": ["ایلام", "دهلران", "آبدانان", "ایوان"],
    "خراسان شمالی": ["بجنورد", "شیروان", "اسفراین", "آشخانه"],
    "خراسان جنوبی": ["بیرجند", "قائن", "طبس", "فردوس"]
};

// ===== Storage =====
function getSellers() {
    const raw = {
        pending: JSON.parse(localStorage.getItem('pending-sellers') || '[]'),
        approved: JSON.parse(localStorage.getItem('approved-sellers') || '[]'),
        rejected: JSON.parse(localStorage.getItem('rejected-sellers') || '[]')
    };
    let changed = false;
    raw.pending.concat(raw.approved, raw.rejected).forEach(function (s) {
        if (typeof s.id !== 'string' || !s.id) { s.id = 'seller_' + s.id; changed = true; }
    });
    if (changed) saveSellers(raw.pending, raw.approved, raw.rejected);
    return raw;
}

function saveSellers(pending, approved, rejected) {
    localStorage.setItem('pending-sellers', JSON.stringify(pending));
    localStorage.setItem('approved-sellers', JSON.stringify(approved));
    localStorage.setItem('rejected-sellers', JSON.stringify(rejected));
}

function isActive(s) { return s.is_active !== false; }

function avgRating(s) {
    const rs = s.reviews || [];
    if (!rs.length) return 0;
    let t = 0;
    rs.forEach(function (r) { t += r.stars; });
    return t / rs.length;
}
function starsHTML(n) {
    const a = Math.round(n || 0);
    let s = '';
    for (let i = 1; i <= 5; i++) s += (i <= a ? '★' : '☆');
    return '<span class="stars">' + s + '</span>';
}
function faNum(v, d) {
    return Number(v).toLocaleString('fa-IR', { maximumFractionDigits: d || 0 });
}
function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(Math.round(price)) + ' تومان';
}

function normalizeLink(type, val) {
    if (!val) return '';
    val = String(val).trim();
    if (/^https?:\/\//i.test(val)) return val;
    if (type === 'telegram') return 'https://t.me/' + val.replace(/^@/, '');
    if (type === 'instagram') return 'https://instagram.com/' + val.replace(/^@/, '');
    if (type === 'whatsapp') {
        const digits = val.replace(/\D/g, '');
        if (digits.indexOf('09') === 0) return 'https://wa.me/98' + digits.slice(1);
        if (digits.indexOf('98') === 0) return 'https://wa.me/' + digits;
        return 'https://wa.me/' + digits;
    }
    if (type === 'website') return 'https://' + val;
    return val;
}

// ===== ویرایشگر تصویر =====
let ieState = { img: null, z: 1, ox: 0, oy: 0, baseW: 0, baseH: 0, onSave: null, rawUrl: '', outW: 800, outH: 450 };

function ensureImageEditor() {
    if (document.getElementById('image-editor-modal')) return;
    const div = document.createElement('div');
    div.className = 'modal-overlay';
    div.id = 'image-editor-modal';
    div.innerHTML = '<div class="modal-box modal-large">' +
        '<div class="modal-icon">🎛️</div>' +
        '<h3>ویرایش تصویر در کادر</h3>' +
        '<p style="font-size:13px">عکس را با کشیدن (ماوس یا انگشت) جابجا کنید و با اسلایدر بزرگ/کوچک کنید تا دقیقاً همان بخشی که می‌خواهید در کادر باشد.</p>' +
        '<div class="img-editor-frame" id="ie-frame"><img id="ie-img" alt="" draggable="false"><div class="ie-hint">✋ بکشید تا جابجا شود</div></div>' +
        '<div class="ie-controls"><label>🔍 بزرگ‌نمایی: <input type="range" id="ie-zoom" min="1" max="4" step="0.01" value="1"></label>' +
        '<button type="button" class="btn btn-secondary btn-small" id="ie-reset">↺ بازنشانی</button></div>' +
        '<div class="form-actions"><button type="button" class="btn btn-secondary" id="ie-cancel">انصراف</button>' +
        '<button type="button" class="btn btn-primary" id="ie-save">✅ تایید و استفاده از این کادر</button></div>' +
        '</div>';
    document.body.appendChild(div);

    document.getElementById('ie-zoom').addEventListener('input', function () {
        ieState.z = parseFloat(this.value);
        applyIE();
    });
    document.getElementById('ie-reset').addEventListener('click', function () {
        ieState.z = 1; ieState.ox = 0; ieState.oy = 0;
        document.getElementById('ie-zoom').value = 1;
        applyIE();
    });
    document.getElementById('ie-cancel').addEventListener('click', closeImageEditor);
    document.getElementById('ie-save').addEventListener('click', saveImageEditor);

    document.getElementById('ie-frame').addEventListener('pointerdown', function (e) {
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        const ox0 = ieState.ox, oy0 = ieState.oy;
        function move(ev) {
            ieState.ox = ox0 + (ev.clientX - startX);
            ieState.oy = oy0 + (ev.clientY - startY);
            applyIE();
        }
        function up() {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
        }
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    });
}

function openImageEditor(src, opts, onSave) {
    ensureImageEditor();
    opts = opts || {};
    const img = new Image();
    if (opts.crossOrigin) img.crossOrigin = 'anonymous';
    img.onload = function () {
        ieState.img = img;
        ieState.z = 1; ieState.ox = 0; ieState.oy = 0;
        ieState.onSave = onSave;
        ieState.rawUrl = src;
        ieState.outW = opts.outW || 800;
        ieState.outH = opts.outH || 450;
        document.getElementById('ie-frame').style.aspectRatio = ieState.outW + ' / ' + ieState.outH;
        document.getElementById('ie-img').src = src;
        document.getElementById('ie-zoom').value = 1;
        document.getElementById('image-editor-modal').classList.add('active');
        requestAnimationFrame(initIEFrame);
    };
    img.onerror = function () {
        if (opts.crossOrigin) openImageEditor(src, {}, onSave);
        else showModal('❌ خطا', 'بارگذاری تصویر ممکن نشد. لینک یا فایل دیگری امتحان کنید.', '❌');
    };
    img.src = src;
}

function initIEFrame() {
    const frame = document.getElementById('ie-frame');
    const fw = frame.clientWidth, fh = frame.clientHeight;
    const img = ieState.img;
    if (!img || !fw) return;
    const scale0 = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
    ieState.baseW = img.naturalWidth * scale0;
    ieState.baseH = img.naturalHeight * scale0;
    applyIE();
}

function applyIE() {
    const frame = document.getElementById('ie-frame');
    const el = document.getElementById('ie-img');
    if (!frame || !el) return;
    const fw = frame.clientWidth, fh = frame.clientHeight;
    const w = ieState.baseW * ieState.z;
    const h = ieState.baseH * ieState.z;
    const maxOx = Math.max(0, (w - fw) / 2);
    const maxOy = Math.max(0, (h - fh) / 2);
    ieState.ox = Math.min(maxOx, Math.max(-maxOx, ieState.ox));
    ieState.oy = Math.min(maxOy, Math.max(-maxOy, ieState.oy));
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.left = ((fw - w) / 2 + ieState.ox) + 'px';
    el.style.top = ((fh - h) / 2 + ieState.oy) + 'px';
}

function closeImageEditor() {
    document.getElementById('image-editor-modal').classList.remove('active');
}

function saveImageEditor() {
    const cb = ieState.onSave;
    const frame = document.getElementById('ie-frame');
    const fw = frame.clientWidth, fh = frame.clientHeight;
    const W = ieState.outW, H = ieState.outH;
    const k = W / fw;
    const w = ieState.baseW * ieState.z * k;
    const h = ieState.baseH * ieState.z * k;
    const left = ((fw - ieState.baseW * ieState.z) / 2 + ieState.ox) * k;
    const top = ((fh - ieState.baseH * ieState.z) / 2 + ieState.oy) * k;
    closeImageEditor();
    try {
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.getContext('2d').drawImage(ieState.img, left, top, w, h);
        cb(canvas.toDataURL('image/jpeg', 0.85), false);
    } catch (err) {
        cb(ieState.rawUrl, true);
    }
}

// ===== نمایش محصول =====
function renderPublicProduct(p, fallbackIcon, colors, sellerId) {
    const hasDiscount = p.discount && p.discount > 0;
    const finalPrice = hasDiscount ? (p.discount_type === 'percent' ? p.price * (1 - p.discount / 100) : p.price - p.discount) : p.price;
    const bg = colors ? 'style="background: linear-gradient(135deg, ' + colors[0] + ', ' + colors[1] + ')"' : '';
    const media = p.image
        ? '<img class="sp-img" src="' + p.image + '" alt="' + p.name + '">'
        : '<div class="sp-img-placeholder" ' + bg + '>' + (fallbackIcon || '📦') + '</div>';
    const onclick = sellerId ? 'onclick="openProductDetail(\'' + sellerId + '\',\'' + p.id + '\')"' : '';
    return '<div class="sp-card" ' + onclick + '>' + media +
        '<div class="sp-body"><h4>' + p.name + '</h4>' +
        '<div class="sp-prices">' + (hasDiscount ? '<span class="original-price">' + formatPrice(p.price) + '</span>' : '') +
        '<span class="final-price">' + formatPrice(finalPrice) + '</span></div>' +
        (hasDiscount ? '<span class="sp-badge">' + (p.discount_type === 'percent' ? p.discount + '% تخفیف' : formatPrice(p.discount) + ' تخفیف') + '</span>' : '') +
        '</div></div>';
}

// ===== جزئیات محصول =====
function ensureProductDetailModal() {
    if (document.getElementById('product-detail-modal')) return;
    const div = document.createElement('div');
    div.className = 'modal-overlay';
    div.id = 'product-detail-modal';
    div.innerHTML = '<div class="modal-box modal-large"><div id="pd-content"></div>' +
        '<div class="form-actions"><button type="button" class="btn btn-primary" onclick="closeProductDetail()">بستن</button></div></div>';
    document.body.appendChild(div);
}

function openProductDetail(sellerId, productId) {
    const approved = getSellers().approved;
    let s = null;
    approved.forEach(function (x) { if (String(x.id) === String(sellerId)) s = x; });
    if (!s) return;
    let p = null;
    (s.products || []).forEach(function (x) { if (String(x.id) === String(productId)) p = x; });
    if (!p) return;
    ensureProductDetailModal();
    const hasDiscount = p.discount && p.discount > 0;
    const finalPrice = hasDiscount ? (p.discount_type === 'percent' ? p.price * (1 - p.discount / 100) : p.price - p.discount) : p.price;
    const cc = catColors(s.category);
    const media = p.image
        ? '<img class="pd-img" src="' + p.image + '" alt="' + p.name + '">'
        : '<div class="pd-placeholder" style="background: linear-gradient(135deg,' + cc[0] + ',' + cc[1] + ')">' + catIcon(s.category) + '</div>';
    document.getElementById('pd-content').innerHTML = media +
        '<h3 style="text-align:right; font-size:20px;">' + p.name + '</h3>' +
        '<div class="product-prices" style="justify-content:flex-start; margin:10px 0;">' +
        (hasDiscount ? '<span class="original-price">' + formatPrice(p.price) + '</span>' : '') +
        '<span class="final-price">' + formatPrice(finalPrice) + '</span>' +
        (hasDiscount ? '<span class="sp-badge">' + (p.discount_type === 'percent' ? p.discount + '% تخفیف' : formatPrice(p.discount) + ' تخفیف') + '</span>' : '') +
        '</div>' +
        '<div class="pd-desc">' + (p.description ? p.description : 'توضیحی برای این محصول ثبت نشده است. برای اطلاعات بیشتر با فروشنده تماس بگیرید.') + '</div>' +
        '<p style="font-size:13px; color:var(--text-secondary); margin-top:12px;">🏪 عرضه‌کننده: ' + s.shop_name + ' | 📞 <a href="tel:' + s.phone + '" style="color:var(--primary)" dir="ltr">' + s.phone + '</a></p>';
    document.getElementById('product-detail-modal').classList.add('active');
}
function closeProductDetail() { document.getElementById('product-detail-modal').classList.remove('active'); }

// ===== جستجو =====
function filterCategories(q) {
    const term = (q || '').trim().toLowerCase();
    let visible = 0;
    document.querySelectorAll('#category-grid .category-card').forEach(function (card) {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        const show = !term || name.indexOf(term) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
    });
    const empty = document.getElementById('cat-search-empty');
    if (empty) empty.style.display = visible ? 'none' : 'block';
}

// ===== Routing =====
function parseRoute() {
    const raw = location.hash.slice(1) || 'home';
    const idx = raw.indexOf('/');
    if (idx === -1) return { page: raw, param: null };
    return { page: raw.slice(0, idx), param: decodeURIComponent(raw.slice(idx + 1)) };
}

// ===== Pages =====
function getPage(name, param) {
    if (name === 'home') return pageHome();
    if (name === 'services') return pageServices();
    if (name === 'cat') return pageCat(param);
    if (name === 'store') return pageStore(param);
    if (name === 'how') return pageHow();
    if (name === 'contact') return pageContact();
    if (name === 'register') return pageRegister();
    if (name === 'dashboard') return '<section><div class="container" id="dashboard-container"></div></section>';
    if (name === 'admin') return pageAdmin();
    return pageHome();
}

function pageHome() {
    let floats = '';
    getCategories().slice(0, 6).forEach(function (c) { floats += '<span class="float-el">' + c.icon + '</span>'; });
    return '<section class="hero"><div class="container hero-container">' +
        '<div class="hero-content">' +
        '<span class="hero-badge">✨ پلتفرم هوشمند ارتباط مشتری و فروشنده</span>' +
        '<h2 class="hero-title">از <span class="highlight">سردرگمی</span> تا <span class="highlight">مَقصد</span><br>در پلتفرم <span class="logo-fa-big">مَعبر</span></h2>' +
        '<p class="hero-desc">مَعبر، پلی است میان شما و بهترین کسب‌وکارهای ایران. بدون واسطه، با مشاوره‌ی مستقیم و تخفیف‌های ویژه.</p>' +
        '<div class="hero-buttons"><a href="#services" class="btn btn-primary">🔍 کشف فروشگاه‌ها</a><a href="#how" class="btn btn-secondary">▶️ نحوه‌ی کار</a></div>' +
        '<div class="hero-stats">' +
        '<div class="stat"><span class="stat-num" id="stat-sellers">۰</span><span class="stat-label">فروشنده‌ی فعال</span></div>' +
        '<div class="stat"><span class="stat-num">+۱۰,۰۰۰</span><span class="stat-label">مشتری راضی</span></div>' +
        '<div class="stat"><span class="stat-num">۲۴/۷</span><span class="stat-label">پشتیبانی</span></div>' +
        '</div></div>' +
        '<div class="hero-visual"><div class="hero-animation">' +
        '<div class="floating-elements">' + floats + '</div>' +
        '<div class="logo-orbit"><div class="orbit-ring ring-1"></div><div class="orbit-ring ring-2"></div><div class="orbit-ring ring-3"></div>' +
        '<div class="orbit-dot dot-1"></div><div class="orbit-dot dot-2"></div><div class="orbit-dot dot-3"></div>' +
        '<div class="logo-center"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="centerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed"/><stop offset="50%" style="stop-color:#db2777"/><stop offset="100%" style="stop-color:#f59e0b"/></linearGradient></defs><path d="M 10 70 Q 50 10 90 70" stroke="url(#centerLogoGrad)" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="8" y="65" width="8" height="20" rx="2" fill="url(#centerLogoGrad)"/><rect x="84" y="65" width="8" height="20" rx="2" fill="url(#centerLogoGrad)"/><circle cx="15" cy="68" r="5" fill="#db2777"/><circle cx="85" cy="68" r="5" fill="#7c3aed"/><path d="M 50 35 L 53 43 L 61 43 L 55 48 L 57 56 L 50 51 L 43 56 L 45 48 L 39 43 L 47 43 Z" fill="#fbbf24"/></svg></div></div>' +
        '<div class="logo-text-animated"><span class="logo-fa-big">مَعبر</span><span class="logo-en-big"><span class="m-gold">M</span>a\'bar</span></div>' +
        '</div></div></div></section>';
}

function pageServices() {
    const cats = getCategories();
    const active = getSellers().approved.filter(isActive);
    let cards = '';
    cats.forEach(function (c) {
        const cc = catColors(c.name);
        let count = 0;
        active.forEach(function (s) { if (s.category === c.name) count++; });
        const img = catImage(c.name);
        cards += '<a class="category-card" data-name="' + c.name + '" href="#cat/' + encodeURIComponent(c.name) + '" style="--c1:' + cc[0] + ';--c2:' + cc[1] + '">' +
            '<span class="cat-media"><span class="cat-media-icon">' + c.icon + '</span>' +
            (img ? '<img src="' + img + '" alt="' + c.name + '" loading="lazy" onerror="this.remove()">' : '') +
            '<span class="cat-overlay"></span></span>' +
            '<span class="cat-body"><h3>' + c.name + '</h3><span class="cat-count">' + (count > 0 ? count + ' فروشگاه فعال' : '—') + '</span></span>' +
            '<span class="cat-arrow">←</span></a>';
    });
    return '<section><div class="container"><div class="section-header">' +
        '<span class="section-badge">🛍️ کشف فروشگاه‌ها</span>' +
        '<h2 class="section-title">دسته‌بندی‌های <span class="logo-fa-inline">مَعبر</span></h2>' +
        '<p class="section-desc">جستجو کنید یا یک دسته را انتخاب کنید</p></div>' +
        '<div class="search-box"><input type="text" id="cat-search" placeholder="🔍 جستجوی نوع خدمات یا دسته‌بندی... (مثلاً: پوشاک)" oninput="filterCategories(this.value)"></div>' +
        '<div class="category-grid" id="category-grid">' + cards + '</div>' +
        '<p id="cat-search-empty" class="no-seller" style="display:none">دسته‌ای با این نام پیدا نشد.</p>' +
        '</div></section>';
}

function pageCat(param) {
    const cat = param || '';
    const icon = catIcon(cat);
    const cc = catColors(cat);
    const sellers = getSellers().approved.filter(function (s) { return isActive(s) && s.category === cat; });
    let body = '';
    if (sellers.length) {
        body = '<div class="sellers-grid">';
        sellers.forEach(function (s) {
            const avg = avgRating(s);
            const cnt = (s.reviews || []).length;
            const logo = s.logo ? '<img src="' + s.logo + '" alt="' + s.shop_name + '">' : '<span>' + icon + '</span>';
            body += '<a class="seller-mini" style="--c1:' + cc[0] + ';--c2:' + cc[1] + '" href="#store/' + s.id + '">' +
                '<span class="mini-logo">' + logo + '</span>' +
                '<span class="mini-name">' + s.shop_name + '</span>' +
                '<span class="mini-stars">' + (cnt ? starsHTML(avg) + ' ' + faNum(avg, 1) : '✨ جدید') + '</span></a>';
        });
        body += '</div>';
    } else {
        body = '<div class="no-seller">هنوز فروشندی در این دسته‌بندی فعال نیست.</div>';
    }
    return '<section><div class="container">' +
        '<div class="breadcrumb"><a href="#services">خدمات</a><span class="sep">/</span><span>' + cat + '</span></div>' +
        '<div class="section-header"><span class="section-badge">' + icon + ' ' + cat + '</span>' +
        '<h2 class="section-title">فروشگاه‌های ' + cat + '</h2>' +
        '<p class="section-desc">یک فروشگاه را انتخاب کنید تا محصولات و نظرات آن را ببینید</p></div>' +
        body + '</div></section>';
}

function pageStore(param) {
    let s = null;
    getSellers().approved.forEach(function (x) { if (String(x.id) === String(param) && isActive(x)) s = x; });
    if (!s) return '<section><div class="container"><div class="no-seller">فروشگاه مورد نظر یافت نشد یا غیرفعال است.</div></div></section>';
    const icon = catIcon(s.category);
    const cc = catColors(s.category);
    const products = s.products || [];
    const reviews = s.reviews || [];
    const avg = avgRating(s);
    const L = s.links || {};
    const socials = [];
    if (L.website) socials.push(['website', '🌐', 'وب‌سایت']);
    if (L.telegram) socials.push(['telegram', '✈️', 'تلگرام']);
    if (L.instagram) socials.push(['instagram', '📸', 'اینستاگرام']);
    if (L.whatsapp) socials.push(['whatsapp', '💬', 'واتساپ']);

    let productsHTML = '';
    if (products.length) {
        productsHTML = '<div class="storefront-products">';
        products.forEach(function (p) { productsHTML += renderPublicProduct(p, icon, cc, s.id); });
        productsHTML += '</div>';
    } else {
        productsHTML = '<div class="no-seller">این فروشگاه هنوز محصولی ثبت نکرده است.</div>';
    }

    let reviewsHTML = '';
    if (reviews.length) {
        reviews.forEach(function (r) {
            reviewsHTML += '<div class="review-card"><div class="review-head"><strong>' + r.author + '</strong><span>' + starsHTML(r.stars) + ' &nbsp; ' + new Date(r.created_at).toLocaleDateString('fa-IR') + '</span></div>' +
                (r.text ? '<div class="review-text">' + r.text + '</div>' : '') + '</div>';
        });
    } else {
        reviewsHTML = '<p class="no-seller">هنوز نظری ثبت نشده است.</p>';
    }

    let socialHTML = '';
    if (socials.length) {
        let btns = '';
        socials.forEach(function (it) {
            btns += '<a class="social-btn sb-' + it[0] + '" target="_blank" rel="noopener" href="' + normalizeLink(it[0], L[it[0]]) + '">' + it[1] + ' ' + it[2] + '</a>';
        });
        socialHTML = '<div class="products-section" style="margin-top:30px"><div class="section-title-row"><h2>🔗 راه‌های ارتباط و شبکه‌های اجتماعی</h2></div><div class="social-links">' + btns + '</div></div>';
    }

    const heroMedia = s.logo ? '<img src="' + s.logo + '" alt="' + s.shop_name + '">' : icon;

    return '<section><div class="container">' +
        '<div class="breadcrumb"><a href="#services">خدمات</a><span class="sep">/</span><a href="#cat/' + encodeURIComponent(s.category) + '">' + s.category + '</a><span class="sep">/</span><span>' + s.shop_name + '</span></div>' +
        '<div class="store-hero"><span class="store-icon" style="--c1:' + cc[0] + ';--c2:' + cc[1] + '">' + heroMedia + '</span>' +
        '<span style="flex:1"><h2>' + s.shop_name + '</h2>' +
        '<div class="store-rating">' + starsHTML(avg) + ' <strong>' + (avg ? faNum(avg, 1) : '−') + '</strong> از ۵ &nbsp;(' + faNum(reviews.length) + ' نظر)</div>' +
        '<p style="color:var(--text-secondary); margin-bottom:8px;">' + (s.description || '') + '</p>' +
        '<span class="category-badge">' + icon + ' ' + s.category + '</span></span></div>' +
        '<div class="store-info-grid">' +
        '<div class="store-info-card"><span class="label">👤 مدیر فروشگاه</span>' + (s.owner_name || ((s.owner_first || '') + ' ' + (s.owner_last || '')) || '-') + '</div>' +
        '<div class="store-info-card"><span class="label">📞 شماره تماس</span><a href="tel:' + s.phone + '" dir="ltr">' + s.phone + '</a></div>' +
        '<div class="store-info-card"><span class="label">📍 استان و شهر</span>' + (s.province || '-') + '، ' + (s.city || '-') + '</div>' +
        '<div class="store-info-card"><span class="label">🏠 آدرس</span>' + (s.address || '-') + '</div>' +
        '</div>' +
        '<div class="products-section"><div class="section-title-row"><h2>🛍️ محصولات و خدمات (' + faNum(products.length) + ')</h2><small style="color:var(--text-secondary)">برای دیدن توضیحات، روی محصول کلیک کنید</small></div>' + productsHTML + '</div>' +
        '<div class="products-section" style="margin-top:30px"><div class="section-title-row"><h2>💬 نظرات و امتیاز (' + faNum(reviews.length) + ')</h2></div>' +
        '<form id="review-form" class="review-form">' +
        '<div class="form-row"><div class="form-group"><label>نام شما (اختیاری)</label><input type="text" id="rv-name" maxlength="40" placeholder="مثلاً: علی محمدی"></div>' +
        '<div class="form-group"><label>امتیاز شما *</label><select id="rv-stars"><option value="5">★★★★★ عالی (۵)</option><option value="4">★★★★ خیلی خوب (۴)</option><option value="3">★★★ متوسط (۳)</option><option value="2">★★ ضعیف (۲)</option><option value="1">★ بد (۱)</option></select></div></div>' +
        '<div class="form-group"><label>نظر شما (اختیاری)</label><textarea id="rv-text" rows="2" placeholder="تجربه‌ی خود را بنویسید..."></textarea></div>' +
        '<button type="submit" class="btn btn-primary btn-small">⭐ ثبت نظر و امتیاز</button></form>' +
        '<div id="reviews-list">' + reviewsHTML + '</div></div>' +
        socialHTML +
        '</div></section>';
}

function pageHow() {
    return '<section><div class="container"><div class="section-header">' +
        '<span class="section-badge">🚀 ساده و سریع</span>' +
        '<h2 class="section-title"><span class="logo-fa-inline">مَعبر</span> چگونه کار می‌کند؟</h2></div>' +
        '<div class="steps">' +
        '<div class="step"><div class="step-num">۱</div><h3>جستجو و انتخاب دسته</h3><p>نوع خدمات را جستجو کنید یا از میان دسته‌بندی‌های رنگی انتخاب کنید.</p></div>' +
        '<div class="step"><div class="step-num">۲</div><h3>فروشگاه و امتیازها</h3><p>لوگو، امتیاز ستاره‌ای و نظرات مشتریان هر فروشگاه را ببینید.</p></div>' +
        '<div class="step"><div class="step-num">۳</div><h3>با تخفیف بخرید</h3><p>محصولات را با توضیحات کامل بررسی و با تخفیف خرید کنید.</p></div>' +
        '</div></div></section>';
}

function pageContact() {
    return '<section><div class="container"><div class="section-header">' +
        '<span class="section-badge">📞 در ارتباط باشید</span><h2 class="section-title">تماس با ما</h2>' +
        '<p class="section-desc">ما همیشه آماده‌ی پاسخگویی به سوالات شما هستیم</p></div>' +
        '<div class="contact-grid">' +
        '<div class="contact-card"><div class="contact-icon">📧</div><h3>ایمیل پشتیبانی</h3><p>برای هرگونه سوال یا پیشنهاد با ما در تماس باشید</p><a href="mailto:falakbinf@gmail.com">falakbinf@gmail.com</a></div>' +
        '<div class="contact-card"><div class="contact-icon">💼</div><h3>همکاری با مَعبر</h3><p>فروشنده هستید؟ کسب‌وکار خود را ثبت کنید</p><a href="#register">ثبت‌نام فروشنده</a></div>' +
        '</div></div></section>';
}

function pageRegister() {
    return '<section><div class="container"><div class="register-container">' +
        '<div class="register-steps">' +
        '<div class="step-indicator active" data-step="1"><div class="step-circle">۱</div><span>شماره موبایل</span></div>' +
        '<div class="step-indicator" data-step="2"><div class="step-circle">۲</div><span>کد تایید</span></div>' +
        '<div class="step-indicator" data-step="3"><div class="step-circle">۳</div><span>اطلاعات فروشگاه</span></div></div>' +

        '<div class="register-step active" data-step="1"><h2>شماره موبایل خود را وارد کنید</h2>' +
        '<p class="subtitle">کد تایید ۶ رقمی تولید و به شما نمایش داده خواهد شد</p>' +
        '<div class="form-group"><label>شماره موبایل *</label><input type="tel" id="phone" dir="ltr" placeholder="09123456789" maxlength="11"></div>' +
        '<div class="price-info"><div class="title">🎁 پیشنهاد ویژه</div><div class="free">۳۰ روز اول کاملاً رایگان!</div>' +
        '<div class="after">پس از اتمام دوره‌ی آزمایشی:</div><div class="price">ماهیانه ۱۹۹,۰۰۰ تومان</div>' +
        '<div class="after" style="margin-top:10px; font-size:14px;">اشتراک ماهانه برای دسترسی کامل به امکانات پلتفرم</div></div>' +
        '<div class="form-actions"><button class="btn btn-primary" id="btn-send-otp">دریافت کد تایید ←</button></div></div>' +

        '<div class="register-step" data-step="2"><h2>کد تایید را وارد کنید</h2>' +
        '<p class="subtitle">کد ۶ رقمی شما: <strong id="otp-code" style="color: var(--primary); font-size: 20px; background: rgba(99,102,241,0.1); padding: 6px 16px; border-radius: 8px; letter-spacing: 4px;"></strong></p>' +
        '<div class="otp-inputs"><input type="text" maxlength="1" class="otp-input"><input type="text" maxlength="1" class="otp-input"><input type="text" maxlength="1" class="otp-input"><input type="text" maxlength="1" class="otp-input"><input type="text" maxlength="1" class="otp-input"><input type="text" maxlength="1" class="otp-input"></div>' +
        '<div class="form-actions"><button class="btn btn-secondary" id="btn-back-1">→ بازگشت</button><button class="btn btn-primary" id="btn-verify-otp">تایید و ادامه ←</button></div></div>' +

        '<div class="register-step" data-step="3"><h2>اطلاعات فروشگاه خود را تکمیل کنید</h2>' +
        '<p class="subtitle">این اطلاعات در ویترین عمومی مَعبر نمایش داده می‌شود</p>' +
        '<form id="register-form">' +
        '<div class="form-group"><label>نام فروشگاه *</label><input type="text" id="shop-name" required></div>' +
        '<div class="form-row"><div class="form-group"><label>نام *</label><input type="text" id="owner-first" required></div>' +
        '<div class="form-group"><label>نام خانوادگی *</label><input type="text" id="owner-last" required></div></div>' +
        '<div class="form-row"><div class="form-group"><label>استان *</label><select id="province" required></select></div>' +
        '<div class="form-group"><label>شهر *</label><select id="city" required></select></div></div>' +
        '<div class="form-group"><label>آدرس دقیق *</label><textarea id="address" rows="2" required placeholder="خیابان، کوچه، پلاک..."></textarea></div>' +
        '<div class="form-group"><label>نوع فعالیت (دسته‌بندی) *</label><select id="category" required></select>' +
        '<img id="category-preview" class="img-preview" alt="پیش‌نمایش دسته" style="width:140px">' +
        '<p style="font-size:12px; color:var(--warning); margin-top:8px;">⚠️ توجه: هر فروشنده فقط می‌تواند <strong>یک نوع فعالیت</strong> ثبت کند. محصولات شما فقط در همین دسته نمایش داده می‌شوند.</p></div>' +
        '<div class="form-group"><label>توضیحات (اختیاری)</label><textarea id="description" rows="2"></textarea></div>' +
        '</form>' +
        '<div class="form-actions"><button class="btn btn-secondary" id="btn-back-2">→ بازگشت</button><button class="btn btn-primary" id="btn-submit-register">ثبت و ارسال برای تایید ✨</button></div></div>' +

        '<div class="register-step" data-step="done"><div class="waiting-approval"><div class="icon">⏳</div>' +
        '<h2>در انتظار تایید مدیر سیستم</h2>' +
        '<p class="subtitle">درخواست شما با موفقیت ثبت شد. پس از تایید، از طریق «پنل فروشنده» با شماره موبایل و کد تایید وارد شوید.</p>' +
        '<div class="price-info"><div class="title">🎁 هدیه خوش‌آمدگویی</div><div class="free">۳۰ روز استفاده رایگان</div><div class="after">پس از تایید حساب شما فعال می‌شود</div></div>' +
        '<a href="#home" class="btn btn-primary" style="margin-top:20px;">بازگشت به صفحه اصلی</a></div></div>' +
        '</div></div></section>';
}

function pageAdmin() {
    return '<section><div class="container">' +
        '<div class="admin-header-box"><h1>👑 پنل مدیریت مَعبر</h1><p>مدیریت فروشندگان، دسته‌بندی‌ها و تنظیمات سیستم</p></div>' +
        '<div id="admin-login-section"><div class="admin-login-box"><h3 style="margin-bottom:20px;">🔐 ورود مدیر</h3>' +
        '<div class="form-group"><label>رمز عبور مدیر</label><input type="password" id="admin-password" placeholder="رمز عبور"></div>' +
        '<button class="btn btn-primary" style="width:100%;" onclick="adminLogin()">ورود</button>' +
        '<button type="button" class="btn btn-secondary" style="width:100%; margin-top:10px;" onclick="resetAdminPassword()">🔄 فراموشی رمز؟ بازنشانی به پیش‌فرض</button>' +
        '<p style="margin-top:15px; font-size:12px; color:var(--text-secondary);">💡 رمز پیش‌فرض: <strong>maabar1405</strong></p></div></div>' +
        '<div id="admin-panel-section" style="display:none;">' +
        '<div class="admin-stats-grid">' +
        '<div class="admin-stat-card"><div class="value" id="admin-total">0</div><div class="label">کل فروشندگان</div></div>' +
        '<div class="admin-stat-card"><div class="value" id="admin-pending-count">0</div><div class="label">در انتظار تایید</div></div>' +
        '<div class="admin-stat-card"><div class="value" id="admin-approved-count">0</div><div class="label">تایید شده</div></div>' +
        '<div class="admin-stat-card"><div class="value" id="admin-inactive-count">0</div><div class="label">غیرفعال</div></div></div>' +
        '<div class="admin-toolbar"><button class="btn btn-secondary btn-small" onclick="openPasswordModal()">🔒 تغییر رمز عبور</button>' +
        '<button class="btn btn-secondary btn-small" onclick="adminLogout()">🚪 خروج</button></div>' +
        '<div class="products-section" style="margin-bottom:30px;"><div class="section-title-row"><h2>🗂️ مدیریت دسته‌بندی‌ها و تصاویر</h2></div>' +
        '<div id="cat-manage-list"></div>' +
        '<div class="cat-add-form"><input type="text" id="new-cat-name" placeholder="نام دسته‌ی جدید (مثلاً لوازم یدکی خودرو)">' +
        '<input type="text" id="new-cat-icon" placeholder="آیکون (مثلاً 🚗)" maxlength="4" style="flex: 0 0 110px; max-width: 110px;">' +
        '<button class="btn btn-primary btn-small" onclick="addCategory()">+ افزودن دسته</button></div></div>' +
        '<div class="products-section"><div class="section-title-row"><h2>⏳ درخواست‌های در انتظار تایید (<span id="pending-tab-count">0</span>)</h2></div><div id="admin-pending-list" class="seller-list"></div></div>' +
        '<div class="products-section" style="margin-top:30px;"><div class="section-title-row"><h2>✅ فروشندگان تایید شده (<span id="approved-tab-count">0</span>)</h2></div><div id="admin-approved-list" class="seller-list"></div></div>' +
        '<div class="products-section" style="margin-top:30px;"><div class="section-title-row"><h2>❌ فروشندگان رد شده (<span id="rejected-tab-count">0</span>)</h2></div><div id="admin-rejected-list" class="seller-list"></div></div>' +
        '</div></div></section>';
}

function navigateTo() {
    const r = parseRoute();
    document.getElementById('main-content').innerHTML = '<div class="page">' + getPage(r.page, r.param) + '</div>';
    const navKey = (r.page === 'cat' || r.page === 'store') ? 'services' : r.page;
    document.querySelectorAll('[data-nav]').forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('data-nav') === navKey);
    });
    if (r.page === 'register') initRegister();
    if (r.page === 'dashboard') initDashboard();
    if (r.page === 'home') loadHomeStats();
    if (r.page === 'admin') initAdmin();
    if (r.page === 'store' && r.param) initStorePage(r.param);
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', navigateTo);

// ===== Theme =====
const themeToggle = document.getElementById('themeToggle');
document.documentElement.setAttribute('data-theme', localStorage.getItem('maabar-theme') || 'light');
themeToggle.addEventListener('click', function () {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('maabar-theme', next);
});

// ===== Particles =====
(function createParticles() {
    const container = document.getElementById('particles');
    const count = window.innerWidth < 768 ? 15 : 30;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.width = p.style.height = (Math.random() * 6 + 3) + 'px';
        p.style.animationDuration = (Math.random() * 10 + 10) + 's';
        p.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(p);
    }
})();

// ===== Modal =====
function showModal(title, message, icon) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-icon').textContent = icon || '✨';
    document.getElementById('modal').classList.add('active');
}
function closeModal() { document.getElementById('modal').classList.remove('active'); }

// ===== مودال تصویر دسته =====
function ensureCatImageModal() {
    if (document.getElementById('cat-image-modal')) return;
    const div = document.createElement('div');
    div.className = 'modal-overlay';
    div.id = 'cat-image-modal';
    div.innerHTML = '<div class="modal-box"><div class="modal-icon">🖼️</div><h3>تصویر دسته‌بندی</h3>' +
        '<div class="form-group" style="text-align:right"><label>۱) آپلود عکس جدید (وارد ویرایشگر می‌شود)</label><input type="file" id="ci-file" accept="image/*"></div>' +
        '<div class="form-group" style="text-align:right"><label>۲) یا آدرس اینترنتی عکس (URL)</label><input type="text" id="ci-url" dir="ltr" placeholder="https://...">' +
        '<button type="button" class="btn btn-secondary btn-small" style="margin-top:8px" onclick="loadUrlIntoEditor()">🎛️ بارگذاری و ویرایش URL</button></div>' +
        '<img id="ci-preview" class="img-preview" alt="پیش‌نمایش">' +
        '<div class="form-actions" style="margin-top:15px"><button type="button" class="btn btn-secondary btn-small" onclick="openCurrentCatEditor()">🎛️ ویرایش تصویر فعلی</button>' +
        '<button type="button" class="btn btn-small" style="background: var(--danger); color: white;" onclick="clearCatImage()">🗑️ حذف تصویر</button></div>' +
        '<div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeCatImageModal()">انصراف</button>' +
        '<button type="button" class="btn btn-primary" onclick="saveCatImage()">💾 ذخیره (جایگزین عکس قبلی)</button></div></div>';
    document.body.appendChild(div);

    document.getElementById('ci-file').addEventListener('change', function (e) {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) { showModal('❌ خطا', 'حجم عکس باید کمتر از ۴ مگابایت باشد', '❌'); return; }
        const reader = new FileReader();
        reader.onload = function (ev) { openImageEditor(ev.target.result, {}, onCatEdited); };
        reader.readAsDataURL(file);
    });
}

function onCatEdited(url, raw) {
    pendingCatImage = url;
    const prev = document.getElementById('ci-preview');
    prev.src = url;
    prev.style.display = 'block';
    if (raw) {
        document.getElementById('ci-url').value = url;
        showModal('⚠️ توجه', 'سرویس میزبان این عکس اجازه‌ی ویرایش نداد؛ خود آدرس بدون ویرایش ذخیره می‌شود.', '⚠️');
    }
}

function loadUrlIntoEditor() {
    const url = document.getElementById('ci-url').value.trim();
    if (!url) { showModal('❌ خطا', 'ابتدا آدرس عکس را وارد کنید', '❌'); return; }
    openImageEditor(url, { crossOrigin: true }, onCatEdited);
}

function openCurrentCatEditor() {
    const cat = getCategories()[editingCatIndex];
    const src = pendingCatImage || (cat && cat.image);
    if (!src) { showModal('❌ خطا', 'ابتدا یک عکس آپلود کنید یا آدرس بدهید', '❌'); return; }
    openImageEditor(src, src.indexOf('data:') === 0 ? {} : { crossOrigin: true }, onCatEdited);
}

function openCatImage(i) {
    ensureCatImageModal();
    editingCatIndex = i;
    pendingCatImage = null;
    const cat = getCategories()[i];
    const prev = document.getElementById('ci-preview');
    const urlInput = document.getElementById('ci-url');
    urlInput.value = '';
    if (cat && cat.image) {
        prev.src = cat.image;
        prev.style.display = 'block';
        if (cat.image.indexOf('data:') !== 0) urlInput.value = cat.image;
    } else {
        prev.style.display = 'none';
        prev.src = '';
    }
    document.getElementById('cat-image-modal').classList.add('active');
}
function closeCatImageModal() { document.getElementById('cat-image-modal').classList.remove('active'); }

function clearCatImage() {
    if (editingCatIndex < 0) return;
    const list = getCategories();
    list[editingCatIndex].image = '';
    saveCategories(list);
    pendingCatImage = null;
    closeCatImageModal();
    renderCategoryManager();
    showModal('🗑️ حذف شد', 'تصویر دسته حذف شد و آیکون پیش‌فرض نمایش داده می‌شود.', '🗑️');
}

function saveCatImage() {
    if (editingCatIndex < 0) return;
    const url = document.getElementById('ci-url').value.trim();
    const value = pendingCatImage || url;
    if (!value) { showModal('❌ خطا', 'لطفاً یک عکس آپلود کنید یا آدرس آن را وارد کنید', '❌'); return; }
    const list = getCategories();
    list[editingCatIndex].image = value;
    saveCategories(list);
    closeCatImageModal();
    renderCategoryManager();
    showModal('✅ ذخیره شد', 'تصویر جدید جایگزین تصویر قبلی شد.', '🖼️');
}

// ===== ویرایش نام دسته =====
function ensureCatEditModal() {
    if (document.getElementById('cat-edit-modal')) return;
    const div = document.createElement('div');
    div.className = 'modal-overlay';
    div.id = 'cat-edit-modal';
    div.innerHTML = '<div class="modal-box"><div class="modal-icon">✏️</div><h3>ویرایش دسته‌بندی</h3>' +
        '<div class="form-group" style="text-align:right"><label>نام دسته</label><input type="text" id="ce-name"></div>' +
        '<div class="form-group" style="text-align:right"><label>آیکون</label><input type="text" id="ce-icon" maxlength="4"></div>' +
        '<div class="form-actions"><button type="button" class="btn btn-secondary" onclick="closeCatEditModal()">انصراف</button>' +
        '<button type="button" class="btn btn-primary" onclick="saveCatEdit()">💾 ذخیره تغییرات</button></div></div>';
    document.body.appendChild(div);
}

function openCatEdit(i) {
    ensureCatEditModal();
    editingCatIndex = i;
    const cat = getCategories()[i];
    document.getElementById('ce-name').value = cat.name;
    document.getElementById('ce-icon').value = cat.icon;
    document.getElementById('cat-edit-modal').classList.add('active');
}
function closeCatEditModal() { document.getElementById('cat-edit-modal').classList.remove('active'); }

function saveCatEdit() {
    const list = getCategories();
    const cat = list[editingCatIndex];
    if (!cat) return;
    const newName = document.getElementById('ce-name').value.trim();
    const newIcon = document.getElementById('ce-icon').value.trim() || cat.icon;
    if (!newName) { showModal('❌ خطا', 'نام دسته نمی‌تواند خالی باشد', '❌'); return; }
    if (newName !== cat.name && list.some(function (c) { return c.name === newName; })) { showModal('⚠️ تکراری', 'دسته‌ای با این نام از قبل وجود دارد', '⚠️'); return; }
    const oldName = cat.name;
    cat.name = newName;
    cat.icon = newIcon;
    saveCategories(list);
    const all = getSellers();
    let changed = 0;
    all.pending.concat(all.approved, all.rejected).forEach(function (s) {
        if (s.category === oldName) { s.category = newName; changed++; }
    });
    saveSellers(all.pending, all.approved, all.rejected);
    closeCatEditModal();
    renderCategoryManager();
    showModal('✅ ویرایش شد', 'نام دسته به «' + newName + '» تغییر کرد و ' + faNum(changed) + ' فروشنده به‌روزرسانی شد.', '✏️');
}

// ===== Home Stats =====
function loadHomeStats() {
    const activeCount = getSellers().approved.filter(isActive).length;
    const el = document.getElementById('stat-sellers');
    if (el) el.textContent = activeCount > 0 ? '+' + faNum(activeCount) : '۰';
}

// ===== Register =====
function initRegister() {
    const provSel = document.getElementById('province');
    if (provSel) {
        provSel.innerHTML = '<option value="">انتخاب استان...</option>';
        Object.keys(IRAN_CITIES).forEach(function (p) {
            const opt = document.createElement('option');
            opt.value = p; opt.textContent = p;
            provSel.appendChild(opt);
        });
        provSel.addEventListener('change', populateCities);
        populateCities();
    }
    const catSel = document.getElementById('category');
    if (catSel) {
        catSel.innerHTML = '<option value="">انتخاب کنید...</option>';
        getCategories().forEach(function (c) {
            const opt = document.createElement('option');
            opt.value = c.name; opt.textContent = c.icon + ' ' + c.name;
            catSel.appendChild(opt);
        });
        catSel.addEventListener('change', function () {
            const prev = document.getElementById('category-preview');
            const img = catImage(catSel.value);
            if (img) {
                prev.src = img;
                prev.style.display = 'block';
                prev.onerror = function () { prev.style.display = 'none'; };
            } else {
                prev.style.display = 'none';
            }
        });
    }
    document.getElementById('btn-send-otp').addEventListener('click', sendOTP);
    document.getElementById('btn-verify-otp').addEventListener('click', verifyOTP);
    document.getElementById('btn-back-1').addEventListener('click', function () { goToStep(1); });
    document.getElementById('btn-submit-register').addEventListener('click', submitRegistration);
    document.getElementById('btn-back-2').addEventListener('click', function () { goToStep(2); });
    setTimeout(setupOTPInputs, 100);
}

function populateCities() {
    const prov = document.getElementById('province').value;
    const citySel = document.getElementById('city');
    citySel.innerHTML = '<option value="">ابتدا استان را انتخاب کنید...</option>';
    if (prov && IRAN_CITIES[prov]) {
        IRAN_CITIES[prov].forEach(function (c) {
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            citySel.appendChild(opt);
        });
    }
}

function sendOTP() {
    const phone = document.getElementById('phone').value.trim();
    if (!/^09\d{9}$/.test(phone)) { showModal('❌ خطا', 'لطفاً شماره موبایل معتبر وارد کنید (مثال: 09123456789)', '❌'); return; }
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    registeredPhone = phone;
    document.getElementById('otp-code').textContent = generatedOTP;
    goToStep(2);
}

function setupOTPInputs() {
    document.querySelectorAll('.otp-input').forEach(function (input, idx, arr) {
        input.addEventListener('input', function (e) { if (e.target.value && idx < arr.length - 1) arr[idx + 1].focus(); });
        input.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !e.target.value && idx > 0) arr[idx - 1].focus(); });
    });
}

function verifyOTP() {
    let code = '';
    document.querySelectorAll('.otp-input').forEach(function (i) { code += i.value; });
    if (code !== generatedOTP) { showModal('❌ کد اشتباه', 'کد تایید نادرست است', '❌'); return; }
    const st = getSellers();
    const existing = st.approved.concat(st.pending).find(function (s) { return s.phone === registeredPhone; });
    if (existing && existing.status === 'approved') {
        if (!isActive(existing)) { showModal('⛔ حساب غیرفعال', 'حساب شما توسط مدیر غیرفعال شده است. با پشتیبانی تماس بگیرید.', '⛔'); return; }
        currentSeller = existing;
        localStorage.setItem('current-seller', JSON.stringify(existing));
        showModal('✅ خوش آمدید', 'شما قبلاً تایید شده‌اید. در حال انتقال به پنل...', '🎉');
        setTimeout(function () { location.hash = '#dashboard'; }, 1200);
        return;
    }
    if (existing && existing.status === 'pending') { goToStep('done'); return; }
    goToStep(3);
}

function submitRegistration() {
    const required = ['shop-name', 'owner-first', 'owner-last', 'province', 'city', 'address', 'category'];
    for (let i = 0; i < required.length; i++) {
        if (!document.getElementById(required[i]).value.trim()) { showModal('❌ خطا', 'لطفاً تمام فیلدهای ضروری را پر کنید', '❌'); return; }
    }
    const st = getSellers();
    if (st.pending.concat(st.approved).some(function (s) { return s.phone === registeredPhone; })) { showModal('⚠️ تکراری', 'این شماره موبایل قبلاً ثبت‌نام کرده است', '⚠️'); return; }
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 30);
    const first = document.getElementById('owner-first').value.trim();
    const last = document.getElementById('owner-last').value.trim();
    const seller = {
        id: 'seller_' + Date.now(),
        phone: registeredPhone,
        shop_name: document.getElementById('shop-name').value.trim(),
        owner_first: first,
        owner_last: last,
        owner_name: first + ' ' + last,
        province: document.getElementById('province').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value.trim(),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value.trim(),
        status: 'pending',
        is_active: true,
        logo: '',
        links: {},
        reviews: [],
        created_at: new Date().toISOString(),
        trial_ends_at: trialEnds.toISOString(),
        products: []
    };
    st.pending.push(seller);
    saveSellers(st.pending, st.approved, st.rejected);
    goToStep('done');
}

function goToStep(step) {
    document.querySelectorAll('.register-step').forEach(function (s) { s.classList.remove('active'); });
    const el = document.querySelector('.register-step[data-step="' + step + '"]');
    if (el) el.classList.add('active');
    document.querySelectorAll('.step-indicator').forEach(function (ind, idx) {
        const s = idx + 1;
        ind.classList.remove('active', 'completed');
        if (typeof step === 'number') {
            if (s < step) ind.classList.add('completed');
            else if (s === step) ind.classList.add('active');
        }
    });
    if (step === 2) setTimeout(setupOTPInputs, 100);
}

// ===== Dashboard =====
function initDashboard() {
    const container = document.getElementById('dashboard-container');
    const saved = localStorage.getItem('current-seller');
    if (!saved) {
        container.innerHTML = '<div class="register-container"><h2 style="text-align:center">🔐 ورود فروشنده</h2>' +
            '<p class="subtitle">شماره موبایل ثبت‌شده‌ی خود را وارد کنید</p>' +
            '<div class="form-group"><label>شماره موبایل</label><input type="tel" id="login-phone" dir="ltr" placeholder="09123456789" maxlength="11"></div>' +
            '<div class="form-actions"><button class="btn btn-primary" id="btn-login-otp">دریافت کد ورود ←</button></div>' +
            '<div id="login-otp-area" style="display:none"><p class="subtitle" style="margin-top:25px">کد ورود شما: <strong id="login-otp-code" style="color: var(--primary); font-size: 20px; background: rgba(99,102,241,0.1); padding: 6px 16px; border-radius: 8px; letter-spacing: 4px;"></strong></p>' +
            '<div class="otp-inputs"><input type="text" maxlength="1" class="otp-input login-otp"><input type="text" maxlength="1" class="otp-input login-otp"><input type="text" maxlength="1" class="otp-input login-otp"><input type="text" maxlength="1" class="otp-input login-otp"><input type="text" maxlength="1" class="otp-input login-otp"><input type="text" maxlength="1" class="otp-input login-otp"></div>' +
            '<div class="form-actions"><button class="btn btn-primary" id="btn-login-verify">ورود به پنل ←</button></div></div>' +
            '<p style="text-align:center; margin-top:25px; color: var(--text-secondary);">حساب ندارید؟ <a href="#register" style="color: var(--primary); font-weight:700">ثبت‌نام کنید</a></p></div>';
        initSellerLogin();
        return;
    }
    currentSeller = JSON.parse(saved);
    let fresh = null;
    getSellers().approved.forEach(function (s) { if (String(s.id) === String(currentSeller.id)) fresh = s; });
    if (!fresh) {
        localStorage.removeItem('current-seller'); currentSeller = null;
        container.innerHTML = '<div class="register-container"><div class="waiting-approval"><div class="icon">⏳</div><h2>در انتظار تایید مدیر</h2><p class="subtitle">حساب شما هنوز تایید نشده است. پس از تایید مدیر، دوباره وارد شوید.</p><button class="btn btn-secondary" onclick="logout()">خروج</button></div></div>';
        return;
    }
    if (!isActive(fresh)) {
        localStorage.removeItem('current-seller'); currentSeller = null;
        container.innerHTML = '<div class="register-container"><div class="waiting-approval"><div class="icon">⛔</div><h2 style="color: var(--danger);">حساب شما غیرفعال شده است</h2><p class="subtitle">دسترسی شما توسط مدیر سیستم موقتاً غیرفعال شده است. برای پیگیری با پشتیبانی تماس بگیرید: falakbinf@gmail.com</p><button class="btn btn-secondary" onclick="logout()">خروج</button></div></div>';
        return;
    }
    currentSeller = fresh;
    renderDashboardMain(container);
}

function initSellerLogin() {
    let loginOTP = '';
    document.getElementById('btn-login-otp').addEventListener('click', function () {
        const phone = document.getElementById('login-phone').value.trim();
        if (!/^09\d{9}$/.test(phone)) { showModal('❌ خطا', 'شماره موبایل معتبر وارد کنید', '❌'); return; }
        loginOTP = Math.floor(100000 + Math.random() * 900000).toString();
        registeredPhone = phone;
        document.getElementById('login-otp-code').textContent = loginOTP;
        document.getElementById('login-otp-area').style.display = 'block';
        setTimeout(function () {
            document.querySelectorAll('.login-otp').forEach(function (input, idx, arr) {
                input.addEventListener('input', function (e) { if (e.target.value && idx < arr.length - 1) arr[idx + 1].focus(); });
            });
        }, 50);
    });
    document.getElementById('btn-login-verify').addEventListener('click', function () {
        let code = '';
        document.querySelectorAll('.login-otp').forEach(function (i) { code += i.value; });
        if (code !== loginOTP) { showModal('❌ کد اشتباه', 'کد ورود نادرست است', '❌'); return; }
        const st = getSellers();
        let seller = null;
        st.approved.forEach(function (s) { if (s.phone === registeredPhone) seller = s; });
        if (seller) {
            if (!isActive(seller)) { showModal('⛔ حساب غیرفعال', 'حساب شما توسط مدیر غیرفعال شده است. با پشتیبانی تماس بگیرید.', '⛔'); return; }
            currentSeller = seller;
            localStorage.setItem('current-seller', JSON.stringify(seller));
            showModal('✅ خوش آمدید', 'ورود موفقیت‌آمیز بود، ' + seller.owner_name, '🎉');
            initDashboard();
            return;
        }
        if (st.pending.some(function (s) { return s.phone === registeredPhone; })) { showModal('⏳ در انتظار تایید', 'حساب شما هنوز توسط مدیر تایید نشده است', '⏳'); return; }
        if (st.rejected.some(function (s) { return s.phone === registeredPhone; })) { showModal('❌ رد شده', 'متاسفانه درخواست شما رد شده است. با پشتیبانی تماس بگیرید.', '❌'); return; }
        showModal('❌ یافت نشد', 'این شماره ثبت‌نام نکرده است', '❌');
    });
}

function renderDashboardMain(container) {
    const pc = catColors(currentSeller.category);
    const L = currentSeller.links || {};
    const logoPrev = currentSeller.logo
        ? '<span class="logo-preview" style="--c1:' + pc[0] + ';--c2:' + pc[1] + '"><img src="' + currentSeller.logo + '"></span>'
        : '<span class="logo-preview" style="--c1:' + pc[0] + ';--c2:' + pc[1] + '">' + catIcon(currentSeller.category) + '</span>';

    container.innerHTML = '<div class="dashboard-header"><div><h1 style="font-size:28px; margin-bottom:5px;">🎉 پنل مدیریت فروشگاه</h1>' +
        '<p style="color: var(--text-secondary);">خوش آمدید، <span id="seller-name">' + currentSeller.owner_name + '</span> (' + currentSeller.shop_name + ')</p></div>' +
        '<div style="display:flex; gap:10px; align-items:center;"><span id="subscription-status" style="padding:8px 16px; background: var(--success); color:white; border-radius:50px; font-size:14px; font-weight:600;">✓ اشتراک فعال</span>' +
        '<button class="btn btn-secondary btn-small" onclick="logout()">خروج</button></div></div>' +
        '<div class="dashboard-stats">' +
        '<div class="stat-card"><div class="label">تعداد محصولات</div><div class="value" id="product-count">0</div></div>' +
        '<div class="stat-card"><div class="label">امتیاز شما</div><div class="value" id="seller-rating" style="font-size:20px;">✨ جدید</div></div>' +
        '<div class="stat-card"><div class="label">دسته‌بندی شما</div><div class="value" id="seller-category" style="font-size:16px;">-</div></div>' +
        '<div class="stat-card"><div class="label">وضعیت</div><div class="value" style="color: var(--success); font-size:16px;">✓ فعال</div></div></div>' +
        '<div class="products-section" style="margin-bottom:30px;"><div class="section-title-row"><h2>⚙️ تنظیمات فروشگاه (لوگو و شبکه‌های اجتماعی)</h2></div>' +
        '<div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap; margin-bottom:20px;">' + logoPrev +
        '<div><label class="btn btn-secondary btn-small" style="cursor:pointer; margin:0;">📤 آپلود / تغییر لوگو<input type="file" id="s-logo-file" accept="image/*" style="display:none"></label>' +
        '<p style="font-size:12px; color:var(--text-secondary); margin-top:8px;">لوگو در کارت فروشگاه و صفحه‌ی شما نمایش داده می‌شود</p></div></div>' +
        '<div class="form-row"><div class="form-group"><label>🌐 وب‌سایت</label><input type="text" id="s-website" dir="ltr" placeholder="https://example.com" value="' + (L.website || '') + '"></div>' +
        '<div class="form-group"><label>✈️ تلگرام</label><input type="text" id="s-telegram" dir="ltr" placeholder="@channel یا https://t.me/..." value="' + (L.telegram || '') + '"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>📸 اینستاگرام</label><input type="text" id="s-instagram" dir="ltr" placeholder="@page یا https://instagram.com/..." value="' + (L.instagram || '') + '"></div>' +
        '<div class="form-group"><label>💬 واتساپ</label><input type="text" id="s-whatsapp" dir="ltr" placeholder="0912... یا https://wa.me/..." value="' + (L.whatsapp || '') + '"></div></div>' +
        '<button class="btn btn-primary btn-small" onclick="saveSellerSettings()">💾 ذخیره تنظیمات</button></div>' +
        '<div class="products-section"><div class="section-title-row"><h2>🛍️ محصولات من</h2>' +
        '<button class="btn btn-primary btn-small" onclick="openProductModal()">+ افزودن محصول جدید</button></div>' +
        '<div id="products-container"></div></div>';

    const avg = avgRating(currentSeller);
    const rc = (currentSeller.reviews || []).length;
    document.getElementById('seller-rating').innerHTML = rc ? starsHTML(avg) + ' ' + faNum(avg, 1) : '✨ جدید';
    document.getElementById('seller-category').textContent = catIcon(currentSeller.category) + ' ' + currentSeller.category;

    const trialEnds = new Date(currentSeller.trial_ends_at);
    const daysLeft = Math.max(0, Math.ceil((trialEnds - new Date()) / 86400000));
    const statusEl = document.getElementById('subscription-status');
    if (daysLeft > 0) statusEl.innerHTML = '🎁 دوره رایگان (' + faNum(daysLeft) + ' روز باقی‌مانده)';
    else { statusEl.innerHTML = '💳 اشتراک ماهیانه ۱۹۹,۰۰۰ تومان'; statusEl.style.background = 'var(--primary)'; }

    document.getElementById('s-logo-file').addEventListener('change', function (e) {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) { showModal('❌ خطا', 'حجم عکس باید کمتر از ۴ مگابایت باشد', '❌'); return; }
        const reader = new FileReader();
        reader.onload = function (ev) {
            openImageEditor(ev.target.result, { outW: 400, outH: 400 }, function (url) {
                currentSeller.logo = url;
                try { syncSeller(); } catch (err) { showModal('❌ خطا', 'حافظه‌ی مرورگر پر شد', '❌'); return; }
                showModal('✅ ذخیره شد', 'لوگوی فروشگاه با موفقیت به‌روزرسانی شد.', '🖼️');
                renderDashboardMain(container);
            });
        };
        reader.readAsDataURL(file);
    });

    renderProducts();
}

function saveSellerSettings() {
    currentSeller.links = {
        website: document.getElementById('s-website').value.trim(),
        telegram: document.getElementById('s-telegram').value.trim(),
        instagram: document.getElementById('s-instagram').value.trim(),
        whatsapp: document.getElementById('s-whatsapp').value.trim()
    };
    try { syncSeller(); } catch (err) { showModal('❌ خطا', 'حافظه‌ی مرورگر پر شد', '❌'); return; }
    showModal('✅ ذخیره شد', 'تنظیمات فروشگاه ذخیره شد و در صفحه‌ی عمومی شما نمایش داده می‌شود.', '🔗');
}

function renderProducts() {
    const products = currentSeller.products || [];
    const container = document.getElementById('products-container');
    document.getElementById('product-count').textContent = faNum(products.length);
    if (!products.length) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📦</div><h3>هنوز محصولی اضافه نکرده‌اید</h3><p>اولین محصول خود را با عکس و توضیحات اضافه کنید</p></div>';
        return;
    }
    const fallbackIcon = catIcon(currentSeller.category);
    const cc = catColors(currentSeller.category);
    let html = '<div class="products-grid">';
    products.forEach(function (p) {
        const hasDiscount = p.discount && p.discount > 0;
        const finalPrice = hasDiscount ? (p.discount_type === 'percent' ? p.price * (1 - p.discount / 100) : p.price - p.discount) : p.price;
        const media = p.image
            ? '<img src="' + p.image + '" alt="' + p.name + '">'
            : '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(135deg,' + cc[0] + ',' + cc[1] + ');font-size:60px;">' + fallbackIcon + '</span>';
        html += '<div class="product-card"><div class="product-image">' + media +
            (hasDiscount ? '<span class="product-badge">' + (p.discount_type === 'percent' ? p.discount + '% تخفیف' : formatPrice(p.discount) + ' تخفیف') + '</span>' : '') +
            '</div><div class="product-info"><h3>' + p.name + '</h3><div class="product-prices">' +
            (hasDiscount ? '<span class="original-price">' + formatPrice(p.price) + '</span>' : '') +
            '<span class="final-price">' + formatPrice(finalPrice) + '</span></div>' +
            '<div class="product-actions"><button class="btn-icon danger" onclick="deleteProduct(\'' + p.id + '\')">🗑️ حذف</button></div></div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function openProductModal() {
    pendingProductImage = '';
    document.getElementById('product-modal').classList.add('active');
    document.getElementById('product-form').reset();
    document.getElementById('discount-fields').style.display = 'none';
    const prev = document.getElementById('p-image-preview');
    prev.style.display = 'none';
    prev.src = '';
    document.getElementById('p-has-discount').onchange = function (e) {
        document.getElementById('discount-fields').style.display = e.target.checked ? 'block' : 'none';
    };
    document.getElementById('p-image').onchange = function (e) {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > 4 * 1024 * 1024) { showModal('❌ خطا', 'حجم عکس باید کمتر از ۴ مگابایت باشد', '❌'); return; }
        const reader = new FileReader();
        reader.onload = function (ev) {
            openImageEditor(ev.target.result, {}, function (url) {
                pendingProductImage = url;
                prev.src = url;
                prev.style.display = 'block';
            });
        };
        reader.readAsDataURL(file);
    };
    document.getElementById('product-form').onsubmit = function (e) { e.preventDefault(); saveProduct(); };
}
function closeProductModal() { document.getElementById('product-modal').classList.remove('active'); }

function saveProduct() {
    const name = document.getElementById('p-name').value.trim();
    const price = parseInt(document.getElementById('p-price').value);
    if (!name || !price) { showModal('❌ خطا', 'نام و قیمت محصول الزامی است', '❌'); return; }
    const hasDiscount = document.getElementById('p-has-discount').checked;
    const product = {
        id: 'product_' + Date.now(),
        name: name,
        image: pendingProductImage || '',
        description: document.getElementById('p-desc').value.trim(),
        price: price,
        discount: hasDiscount ? (parseInt(document.getElementById('p-discount').value) || 0) : 0,
        discount_type: document.getElementById('p-discount-type').value,
        created_at: new Date().toISOString()
    };
    currentSeller.products = currentSeller.products || [];
    currentSeller.products.push(product);
    try { syncSeller(); } catch (err) {
        currentSeller.products.pop();
        showModal('❌ خطا', 'حجم عکس زیاد است و حافظه‌ی مرورگر پر شد. لطفاً عکس کوچک‌تری انتخاب کنید.', '❌');
        return;
    }
    closeProductModal();
    renderProducts();
    showModal('✅ موفقیت', 'محصول با موفقیت اضافه شد و در ویترین عمومی نمایش داده می‌شود!', '🎉');
}

function deleteProduct(id) {
    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
    currentSeller.products = currentSeller.products.filter(function (p) { return p.id !== id; });
    syncSeller();
    renderProducts();
}

function syncSeller() {
    const st = getSellers();
    const idx = st.approved.findIndex(function (s) { return String(s.id) === String(currentSeller.id); });
    if (idx !== -1) { st.approved[idx] = currentSeller; saveSellers(st.pending, st.approved, st.rejected); }
    localStorage.setItem('current-seller', JSON.stringify(currentSeller));
}

function logout() {
    localStorage.removeItem('current-seller');
    currentSeller = null;
    location.hash = '#home';
}

// ===== ثبت نظر =====
function initStorePage(id) {
    const form = document.getElementById('review-form');
    if (form) form.onsubmit = function (e) { e.preventDefault(); addReview(id); };
}

function addReview(id) {
    const stars = parseInt(document.getElementById('rv-stars').value);
    const text = document.getElementById('rv-text').value.trim();
    const author = document.getElementById('rv-name').value.trim() || 'کاربر مَعبر';
    const st = getSellers();
    let s = null;
    st.approved.forEach(function (x) { if (String(x.id) === String(id)) s = x; });
    if (!s) return;
    s.reviews = s.reviews || [];
    s.reviews.unshift({ id: 'rv_' + Date.now(), stars: stars, text: text, author: author, created_at: new Date().toISOString() });
    saveSellers(st.pending, st.approved, st.rejected);
    showModal('✅ ثبت شد', 'از امتیاز و نظر شما سپاسگزاریم!', '💖');
    navigateTo();
}

// ===== Admin =====
function getAdminPassword() { return localStorage.getItem(ADMIN_PASSWORD_KEY) || 'maabar1405'; }

function initAdmin() {
    if (sessionStorage.getItem('admin-logged-in') === 'true') {
        document.getElementById('admin-login-section').style.display = 'none';
        document.getElementById('admin-panel-section').style.display = 'block';
        loadAdminData();
    }
}

function adminLogin() {
    const entered = (document.getElementById('admin-password').value || '').trim();
    if (entered === getAdminPassword()) {
        sessionStorage.setItem('admin-logged-in', 'true');
        document.getElementById('admin-login-section').style.display = 'none';
        document.getElementById('admin-panel-section').style.display = 'block';
        loadAdminData();
    } else {
        showModal('❌ خطا', 'رمز عبور نادرست است. اگر رمز را فراموش کرده‌اید، روی «بازنشانی به پیش‌فرض» کلیک کنید.', '❌');
    }
}

function resetAdminPassword() {
    if (!confirm('رمز عبور مدیر به مقدار پیش‌فرض (maabar1405) بازنشانی شود؟')) return;
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
    const inp = document.getElementById('admin-password');
    if (inp) inp.value = '';
    showModal('✅ بازنشانی شد', 'رمز عبور مدیر به maabar1405 بازنشانی شد. اکنون با آن وارد شوید.', '🔑');
}

function adminLogout() { sessionStorage.removeItem('admin-logged-in'); location.hash = '#home'; }

function openPasswordModal() {
    document.getElementById('cur-pwd').value = '';
    document.getElementById('new-pwd').value = '';
    document.getElementById('conf-pwd').value = '';
    document.getElementById('password-modal').classList.add('active');
}
function closePasswordModal() { document.getElementById('password-modal').classList.remove('active'); }

function saveAdminPassword() {
    const cur = document.getElementById('cur-pwd').value;
    const neu = document.getElementById('new-pwd').value;
    const conf = document.getElementById('conf-pwd').value;
    if (cur !== getAdminPassword()) { showModal('❌ خطا', 'رمز فعلی نادرست است', '❌'); return; }
    if (neu.length < 6) { showModal('❌ خطا', 'رمز جدید باید حداقل ۶ کاراکتر باشد', '❌'); return; }
    if (neu !== conf) { showModal('❌ خطا', 'تکرار رمز با رمز جدید یکسان نیست', '❌'); return; }
    localStorage.setItem(ADMIN_PASSWORD_KEY, neu);
    closePasswordModal();
    showModal('✅ موفقیت', 'رمز عبور با موفقیت تغییر کرد', '🔒');
}

function renderCategoryManager() {
    const list = getCategories();
    const st = getSellers();
    const box = document.getElementById('cat-manage-list');
    if (!box) return;
    let html = '';
    list.forEach(function (c, i) {
        const inUse = st.approved.concat(st.pending).some(function (s) { return s.category === c.name; });
        html += '<div class="cat-manage-row"><span class="cat-name">' + c.icon + ' ' + c.name +
            (inUse ? ' <small style="color:var(--warning)">(دارای فروشنده)</small>' : '') +
            (c.image ? ' 🖼️' : '') + '</span>' +
            '<span style="display:flex; gap:8px; flex-wrap:wrap;">' +
            '<button class="btn-approve" onclick="openCatEdit(' + i + ')">✏️ ویرایش</button>' +
            '<button class="btn-approve" onclick="openCatImage(' + i + ')">🖼️ تصویر</button>' +
            '<button class="btn-reject" onclick="deleteCategory(' + i + ')">🗑️ حذف</button></span></div>';
    });
    box.innerHTML = html;
}

function addCategory() {
    const name = document.getElementById('new-cat-name').value.trim();
    const icon = document.getElementById('new-cat-icon').value.trim() || '🏪';
    if (!name) { showModal('❌ خطا', 'نام دسته را وارد کنید', '❌'); return; }
    const list = getCategories();
    if (list.some(function (c) { return c.name === name; })) { showModal('⚠️ تکراری', 'این دسته قبلاً وجود دارد', '⚠️'); return; }
    list.push({ name: name, icon: icon });
    saveCategories(list);
    document.getElementById('new-cat-name').value = '';
    document.getElementById('new-cat-icon').value = '';
    renderCategoryManager();
    showModal('✅ اضافه شد', 'دسته‌ی «' + name + '» اضافه شد. حالا با دکمه‌ی «🖼️ تصویر» می‌توانید عکس آن را تنظیم کنید.', '✅');
}

function deleteCategory(i) {
    const list = getCategories();
    const cat = list[i];
    if (!cat) return;
    const st = getSellers();
    const inUse = st.approved.concat(st.pending).some(function (s) { return s.category === cat.name; });
    const msg = inUse
        ? 'فروشندگانی در دسته‌ی «' + cat.name + '» ثبت‌نام کرده‌اند. با حذف این دسته، آن‌ها در ویترین نمایش داده نمی‌شوند. ادامه می‌دهید؟'
        : 'دسته‌ی «' + cat.name + '» حذف شود؟';
    if (!confirm(msg)) return;
    list.splice(i, 1);
    saveCategories(list);
    renderCategoryManager();
    showModal('🗑️ حذف شد', 'دسته‌ی «' + cat.name + '» حذف شد.', '🗑️');
}

function adminAction(fn) {
    try { fn(); loadAdminData(); } catch (err) { loadAdminData(); showModal('❌ خطا', 'مشکلی پیش آمد: ' + err.message, '❌'); }
}

function loadAdminData() {
    const st = getSellers();
    const inactive = st.approved.filter(function (s) { return !isActive(s); }).length;
    function set(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
    set('admin-total', st.pending.length + st.approved.length + st.rejected.length);
    set('admin-pending-count', st.pending.length);
    set('admin-approved-count', st.approved.length);
    set('admin-inactive-count', inactive);
    set('pending-tab-count', st.pending.length);
    set('approved-tab-count', st.approved.length);
    set('rejected-tab-count', st.rejected.length);
    renderCategoryManager();
    document.getElementById('admin-pending-list').innerHTML = st.pending.length === 0
        ? '<p style="text-align:center; padding:40px; color:var(--text-secondary)">درخواست جدیدی وجود ندارد</p>'
        : st.pending.map(function (s) { return renderSellerCard(s, 'pending'); }).join('');
    document.getElementById('admin-approved-list').innerHTML = st.approved.length === 0
        ? '<p style="text-align:center; padding:40px; color:var(--text-secondary)">هنوز فروشنده‌ای تایید نشده است</p>'
        : st.approved.map(function (s) { return renderSellerCard(s, 'approved'); }).join('');
    document.getElementById('admin-rejected-list').innerHTML = st.rejected.length === 0
        ? '<p style="text-align:center; padding:40px; color:var(--text-secondary)">موردی وجود ندارد</p>'
        : st.rejected.map(function (s) { return renderSellerCard(s, 'rejected'); }).join('');
}

function renderSellerCard(s, status) {
    const active = isActive(s);
    let badge = '';
    if (status === 'pending') badge = '<span class="status-badge status-pending">در انتظار بررسی</span>';
    if (status === 'approved') badge = active ? '<span class="status-badge status-approved">✓ تایید و فعال</span>' : '<span class="status-badge status-rejected">⛔ تایید شده ولی غیرفعال</span>';
    if (status === 'rejected') badge = '<span class="status-badge status-rejected">✗ رد شده</span>';
    let actions = '';
    if (status === 'pending') {
        actions = '<button class="btn-approve" onclick="approveSeller(\'' + s.id + '\')">✓ تایید</button><button class="btn-reject" onclick="rejectSeller(\'' + s.id + '\')">✗ رد</button>';
    } else if (status === 'approved') {
        actions = (active
            ? '<button class="btn-reject" onclick="toggleSellerActive(\'' + s.id + '\')">⛔ غیرفعال کردن</button>'
            : '<button class="btn-approve" onclick="toggleSellerActive(\'' + s.id + '\')">✅ فعال کردن</button>') +
            '<button class="btn-reject" onclick="deleteSeller(\'' + s.id + '\')">🗑️ حذف کامل</button>';
    } else {
        actions = '<button class="btn-approve" onclick="approveSeller(\'' + s.id + '\')">✓ تایید مجدد</button><button class="btn-reject" onclick="deleteSeller(\'' + s.id + '\')">🗑️ حذف کامل</button>';
    }
    const rc = (s.reviews || []).length;
    return '<div class="seller-card"><div class="seller-info"><h3>' + catIcon(s.category) + ' ' + s.shop_name + '</h3>' +
        '<p>👤 ' + (s.owner_first || '') + ' ' + (s.owner_last || s.owner_name || '') + '</p>' +
        '<p>📱 ' + s.phone + '</p>' +
        '<p>📍 استان ' + (s.province || '-') + ' - ' + (s.city || '-') + '</p>' +
        '<p>🏠 ' + (s.address || '-') + '</p>' +
        '<p>📂 ' + (s.category || '-') + '</p>' +
        '<p>⭐ امتیاز: ' + (rc ? faNum(avgRating(s), 1) + ' از ۵ (' + faNum(rc) + ' نظر)' : 'بدون امتیاز') + '</p>' +
        (s.description ? '<p>💬 ' + s.description + '</p>' : '') + badge +
        '</div><div class="seller-actions">' + actions + '</div></div>';
}

function approveSeller(id) {
    if (!confirm('آیا از تایید این فروشنده مطمئن هستید؟')) return;
    adminAction(function () {
        const st = getSellers();
        let seller = null;
        st.pending.forEach(function (s) { if (String(s.id) === String(id)) seller = s; });
        if (!seller) st.rejected.forEach(function (s) { if (String(s.id) === String(id)) seller = s; });
        if (!seller) throw new Error('فروشنده یافت نشد');
        seller.status = 'approved';
        seller.is_active = true;
        seller.approved_at = new Date().toISOString();
        seller.products = seller.products || [];
        saveSellers(
            st.pending.filter(function (s) { return String(s.id) !== String(id); }),
            st.approved.filter(function (s) { return String(s.id) !== String(id); }).concat([seller]),
            st.rejected.filter(function (s) { return String(s.id) !== String(id); })
        );
        showModal('✅ تایید شد', '«' + seller.shop_name + '» تایید و فعال شد و در دسته‌ی «' + seller.category + '» نمایش داده می‌شود.', '✅');
    });
}

function rejectSeller(id) {
    if (!confirm('آیا از رد این درخواست مطمئن هستید؟')) return;
    adminAction(function () {
        const st = getSellers();
        let seller = null;
        st.pending.forEach(function (s) { if (String(s.id) === String(id)) seller = s; });
        if (!seller) throw new Error('فروشنده یافت نشد');
        seller.status = 'rejected';
        saveSellers(
            st.pending.filter(function (s) { return String(s.id) !== String(id); }),
            st.approved,
            st.rejected.filter(function (s) { return String(s.id) !== String(id); }).concat([seller])
        );
        showModal('❌ رد شد', 'درخواست «' + seller.shop_name + '» رد شد.', '❌');
    });
}

function toggleSellerActive(id) {
    adminAction(function () {
        const st = getSellers();
        let seller = null;
        st.approved.forEach(function (s) { if (String(s.id) === String(id)) seller = s; });
        if (!seller) throw new Error('فروشنده یافت نشد');
        seller.is_active = !isActive(seller);
        saveSellers(st.pending, st.approved, st.rejected);
        if (isActive(seller)) showModal('✅ فعال شد', '«' + seller.shop_name + '» دوباره فعال شد و در ویترین عمومی نمایش داده می‌شود.', '✅');
        else showModal('⛔ غیرفعال شد', '«' + seller.shop_name + '» موقتاً غیرفعال شد و از ویترین عمومی حذف شد.', '⛔');
    });
}

function deleteSeller(id) {
    if (!confirm('حذف کامل این فروشنده و تمام محصولاتش؟ این عمل قابل بازگشت نیست!')) return;
    adminAction(function () {
        const st = getSellers();
        let seller = null;
        st.pending.concat(st.approved, st.rejected).forEach(function (s) { if (String(s.id) === String(id)) seller = s; });
        saveSellers(
            st.pending.filter(function (s) { return String(s.id) !== String(id); }),
            st.approved.filter(function (s) { return String(s.id) !== String(id); }),
            st.rejected.filter(function (s) { return String(s.id) !== String(id); })
        );
        showModal('🗑️ حذف شد', '«' + (seller ? seller.shop_name : 'فروشنده') + '» به طور کامل حذف شد.', '🗑️');
    });
}

// ===== Init =====
window.addEventListener('load', navigateTo);