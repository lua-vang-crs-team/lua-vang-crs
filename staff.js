/* ============================================================
   LỤA VÀNG RESORT & SPA — STAFF PORTAL
   staff.js  |  Production Grade PMS/CRS Logic
   Fix: Khai báo DEFAULT_ROOM_BASE_RATES & Khớp chuẩn Edge Function Thẻ 3
   ============================================================ */

const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;
const REST_BASE    = `${SUPABASE_URL}/rest/v1`;
const STAFF_PIN    = "2026";

// Danh mục 6 hạng phòng chuẩn khớp 100% database inventory
const DEFAULT_ROOM_TYPES = [
  "Deluxe Ocean View",
  "Premier Garden View",
  "Junior Suite Lagoon",
  "Lantern Pool Villa",
  "Two-Bedroom Beachfront Villa",
  "Presidential Silk Villa"
];

// Khai báo bảng Base Rate chuẩn để fallback không bao giờ bị undefined
const DEFAULT_ROOM_BASE_RATES = {
  "deluxe ocean view":           5200000,
  "premier garden view":          4800000,
  "junior suite lagoon":         7500000,
  "lantern pool villa":          11500000,
  "two-bedroom beachfront villa": 14500000,
  "presidential silk villa":     28000000
};

// ── BỘ TỪ ĐIỂN SONG NGỮ VI / EN ──────────────────────────────
const I18N = {
  vi: {
    'hotel-sub-staff':   'Resort &amp; Spa &ensp;·&ensp; Hệ thống quản trị tập trung',
    'pin-sub':           'Cổng quản trị nội bộ',
    'pin-btn':           'Đăng nhập',
    'pin-hint':          'Demo access code: <strong>2026</strong> – For academic demonstration only',
    'btn-logout':        'Đăng xuất',
    'stat-arrivals':     'Khách đến hôm nay',
    'stat-departures':   'Khách đi hôm nay',
    'stat-occupied':     'Đang lưu trú',
    'stat-available':    'Phòng còn trống',
    'tab-bookings':      'Quản lý đặt phòng',
    'tab-new-booking':   'Tạo đặt phòng mới',
    'tab-availability':  'Kiểm tra phòng',
    'tab-rates':         'Quản lý bảng giá',
    'ph-search':         'Tên khách / Mã đặt phòng / Kênh…',
    'opt-all-status':    'Tất cả trạng thái',
    'opt-confirmed':     'Đã xác nhận',
    'opt-checked-in':    'Đang lưu trú',
    'opt-checked-out':   'Đã hoàn tất',
    'opt-cancelled':     'Đã hủy',
    'btn-search-bookings':'Tìm kiếm',
    'new-bk-tag':        'Đặt phòng tại quầy',
    'new-bk-h2':         'Tiếp nhận đặt phòng trực tiếp',
    'label-checkin':     'Ngày nhận phòng',
    'label-checkout':    'Ngày trả phòng',
    'btn-search-avail':  'Kiểm tra phòng trống',
    'label-room':        'Phòng đã chọn',
    'label-guest':       'Họ và tên khách đại diện',
    'ph-guest':          'Nguyễn Văn A',
    'ph-room':           'Chọn phòng từ danh sách',
    'label-email':       'Địa chỉ Email',
    'label-phone':       'Số điện thoại liên hệ',
    'label-extra':       'Khách đi cùng phòng (nếu có)',
    'ph-extra':          'Tên, email — phân cách bởi dấu chấm phẩy',
    'btn-book':          'Xác nhận đặt phòng',
    'avail-tag':         'Tra cứu nhanh',
    'avail-h2':          'Kiểm tra tình trạng phòng theo giai đoạn',
    'btn-search':        'Kiểm tra',
    'rate-tag':          'Quản trị giá bán & Kênh phân phối',
    'rate-h2':           'Cập nhật giá bán cơ bản (Base Rate)',
    'label-room-type':   'Hạng phòng áp dụng',
    'label-base-rate':   'Giá cơ bản / đêm (VNĐ)',
    'ph-base-rate':      'Chọn hạng phòng để tải giá...',
    'label-changed-by':  'Bộ phận thực hiện',
    'btn-update-rate':   'Lưu thay đổi giá',
    'rate-preview-tag':  'Bảng giá phân phối tự động theo chính sách kênh',
    'card-ch-direct':    'Kênh Direct (Website)',
    'card-sub-direct':   'Chiết khấu 5% (× 0.95)',
    'card-ch-ota1':      'OTA 1 · VietStay',
    'card-sub-ota1':     'Phí hoa hồng 5% (× 1.05)',
    'card-ch-ota2':      'OTA 2 · StayAsia',
    'card-sub-ota2':     'Phí hoa hồng 5% (× 1.05)',
    'card-ch-gds':       'Kênh GDS / Đại lý',
    'card-sub-gds':      'Giá chuẩn (× 1.00)',
    'rate-history-tag':  'Lịch sử điều chỉnh biểu giá',
    'btn-refresh':       '↻ Làm mới',
    'footer-text':       'Lụa Vàng Resort & Spa · Hệ thống quản lý phòng & vận hành tập trung · 2026',
    'bp-label':          'Mã đặt phòng — lưu lại để tra cứu và hủy phòng',
    'btn-copy':          'Sao chép mã',
    'btn-copied':        'Đã sao chép ✓',
    'table-th-id':       'Mã Booking',
    'table-th-room':     'Số phòng',
    'table-th-guest':    'Khách hàng',
    'table-th-checkin':  'Nhận phòng',
    'table-th-checkout': 'Trả phòng',
    'table-th-status':   'Trạng thái',
    'table-th-channel':  'Kênh đặt',
    'table-th-actions':  'Thao tác',
    'table-th-hist-room':'Hạng phòng',
    'table-th-hist-old': 'Giá cũ',
    'table-th-hist-new': 'Giá điều chỉnh',
    'table-th-hist-by':  'Người thực hiện',
    'table-th-hist-time':'Thời gian cập nhật',
    'btn-pick':          'Chọn',
    'contact':           'Liên hệ',
    'msg-loading':       'Đang tải dữ liệu…',
    'msg-searching':     'Đang tìm kiếm…',
    'msg-no-results':    'Không tìm thấy dữ liệu phù hợp.',
    'msg-no-dates':      'Vui lòng chọn ngày nhận và trả phòng.',
    'msg-no-room-sel':   'Vui lòng chọn phòng lưu trú.',
    'msg-no-guest':      'Vui lòng nhập tên khách lưu trú.',
    'msg-no-type':       'Vui lòng chọn hạng phòng.',
    'msg-no-rate':       'Vui lòng nhập mức giá hợp lệ (≥ 100,000 ₫).',
    'msg-same-rate':     'Mức giá mới trùng với giá hiện tại. Vui lòng nhập giá khác để cập nhật.',
    'msg-no-avail-rooms':'Hiện không có phòng trống cho khoảng thời gian này.',
    'msg-updating-rate': 'Đang đồng bộ biểu giá mới sang các kênh…',
    'msg-booking':       'Đang tiến hành tạo đơn đặt phòng…',
    'msg-book-success':  'Đã tạo đơn đặt phòng thành công.',
    'msg-conflict':      'Phòng đã có khách đặt trùng ngày (Xung đột trạng thái).',
    'no-history':        'Chưa có lịch sử thay đổi biểu giá cho hạng phòng này.',
    'loading-types':     'Đang tải danh mục phòng…',
    'select-type-first': 'Vui lòng chọn hạng phòng để xem bảng giá và lịch sử…',
    'select-type-opt':   'Chọn hạng phòng…',
    'msg-rate-error':    'Không thể cập nhật biểu giá. Vui lòng kiểm tra lại cấu hình.',
    'msg-found-rooms':   (n) => `Tìm thấy <strong>${n}</strong> phòng sẵn sàng phục vụ.`,
    'msg-connect-err':   (e) => `Lỗi kết nối máy chủ: ${e}`,
    'msg-rate-success':  (rt, r) => `Đã cập nhật giá cơ sở cho hạng <strong>${rt}</strong> thành <strong>${vndFmt(r)}</strong>. Toàn bộ các kênh phân phối đã được đồng bộ.`,
    'msg-cancel-ok':     (id) => `Đã hủy thành công đơn đặt phòng <strong>${id}</strong>.`,
    'confirm-cancel':    (id) => `Xác nhận hủy đặt phòng:\n\n${id}\n\nThao tác này sẽ giải phóng phòng trên tất cả các kênh phân phối.`,
  },
  en: {
    'hotel-sub-staff':   'Resort &amp; Spa &ensp;·&ensp; Central Management System',
    'pin-sub':           'Internal Staff Portal',
    'pin-btn':           'Sign In',
    'pin-hint':          'Demo access code: <strong>2026</strong> – For academic demonstration only',
    'btn-logout':        'Sign Out',
    'stat-arrivals':     'Arrivals Today',
    'stat-departures':   'Departures Today',
    'stat-occupied':     'In-House Guests',
    'stat-available':    'Available Rooms',
    'tab-bookings':      'Reservations',
    'tab-new-booking':   'New Reservation',
    'tab-availability':  'Room Availability',
    'tab-rates':         'Rate Management',
    'ph-search':         'Guest name / Booking ID / Channel…',
    'opt-all-status':    'All Statuses',
    'opt-confirmed':     'Confirmed',
    'opt-checked-in':    'Checked-in',
    'opt-checked-out':   'Checked-out',
    'opt-cancelled':     'Cancelled',
    'btn-search-bookings':'Search',
    'new-bk-tag':        'Front Desk Booking',
    'new-bk-h2':         'Create In-Person Reservation',
    'label-checkin':     'Check-in Date',
    'label-checkout':    'Check-out Date',
    'btn-search-avail':  'Check Availability',
    'label-room':        'Selected Room',
    'label-guest':       'Primary Guest Name',
    'ph-guest':          'John Doe',
    'ph-room':           'Select room from list',
    'label-email':       'Email Address',
    'label-phone':       'Phone Number',
    'label-extra':       'Accompanying Guests (optional)',
    'ph-extra':          'Name, email — separated by semicolons',
    'btn-book':          'Confirm Reservation',
    'avail-tag':         'Quick Search',
    'avail-h2':          'Room Availability Status',
    'btn-search':        'Check',
    'rate-tag':          'Revenue & Channel Management',
    'rate-h2':           'Update Room Base Rates',
    'label-room-type':   'Room Category',
    'label-base-rate':   'Base Rate / Night (VND)',
    'ph-base-rate':      'Select a category to view rates...',
    'label-changed-by':  'Updated By',
    'btn-update-rate':   'Apply Rate Change',
    'rate-preview-tag':  'Auto-calculated Channel Rates',
    'card-ch-direct':    'Direct Channel (Website)',
    'card-sub-direct':   'Direct Discount 5% (× 0.95)',
    'card-ch-ota1':      'OTA 1 · VietStay',
    'card-sub-ota1':     'Commission Fee 5% (× 1.05)',
    'card-ch-ota2':      'OTA 2 · StayAsia',
    'card-sub-ota2':     'Commission Fee 5% (× 1.05)',
    'card-ch-gds':       'GDS / Travel Agent',
    'card-sub-gds':      'Standard Rate (× 1.00)',
    'rate-history-tag':  'Rate Modification History',
    'btn-refresh':       '↻ Refresh',
    'footer-text':       'Lua Vang Resort & Spa · Centralized PMS/CRS Portal · 2026',
    'bp-label':          'Booking Reference Code',
    'btn-copy':          'Copy Code',
    'btn-copied':        'Copied ✓',
    'table-th-id':       'Booking ID',
    'table-th-room':     'Room',
    'table-th-guest':    'Guest',
    'table-th-checkin':  'Check-in',
    'table-th-checkout': 'Check-out',
    'table-th-status':   'Status',
    'table-th-channel':  'Channel',
    'table-th-actions':  'Actions',
    'table-th-hist-room':'Category',
    'table-th-hist-old': 'Previous Rate',
    'table-th-hist-new': 'Updated Rate',
    'table-th-hist-by':  'Updated By',
    'table-th-hist-time':'Timestamp',
    'btn-pick':          'Select',
    'contact':           'Contact us',
    'msg-loading':       'Loading…',
    'msg-searching':     'Searching…',
    'msg-no-results':    'No reservations found.',
    'msg-no-dates':      'Please select dates.',
    'msg-no-room-sel':   'Please choose a room.',
    'msg-no-guest':      'Please enter guest name.',
    'msg-no-type':       'Please select a room category.',
    'msg-no-rate':       'Please enter a valid rate (≥ 100,000 VND).',
    'msg-same-rate':     'New rate is identical to the current rate. Please enter a different rate.',
    'msg-no-avail-rooms':'No rooms available for the selected dates.',
    'msg-updating-rate': 'Synchronizing new rates across channels…',
    'msg-booking':       'Creating reservation…',
    'msg-book-success':  'Reservation successfully created.',
    'msg-conflict':      'Room conflict detected (already reserved).',
    'no-history':        'No rate change history recorded for this room type.',
    'loading-types':     'Loading room categories…',
    'select-type-first': 'Select a room category to review pricing and logs…',
    'select-type-opt':   'Select room category…',
    'msg-rate-error':    'Could not update rates. Please check configuration.',
    'msg-found-rooms':   (n) => `Found <strong>${n}</strong> available room${n !== 1 ? 's' : ''}.`,
    'msg-connect-err':   (e) => `Server error: ${e}`,
    'msg-rate-success':  (rt, r) => `Base rate for <strong>${rt}</strong> updated to <strong>${vndFmt(r)}</strong>. All distribution channels synchronized.`,
    'msg-cancel-ok':     (id) => `Reservation <strong>${id}</strong> has been cancelled.`,
    'confirm-cancel':    (id) => `Confirm cancellation of booking:\n\n${id}\n\nInventory will be reopened on all channels.`,
  },
};

let currentLang          = 'vi';
let currentRoomTypeRate  = null;
let currentBaseRate      = null;
let nbSearchDates        = {};
let nbSelectedRoom       = null;
let isUpdatingRate       = false;

// ── TRANSLATE & FORMAT ─────────────────────────────────────────
function t(key, ...args) {
  const tbl = I18N[currentLang] || I18N.vi;
  const e   = (key in tbl) ? tbl[key] : (key in I18N.vi ? I18N.vi[key] : key);
  return typeof e === 'function' ? e(...args) : e;
}

function vndFmt(n) { return Number(n).toLocaleString('vi-VN') + ' ₫'; }

function rateStr(low, high) {
  if (low && high && String(low) !== String(high)) return `${vndFmt(low)} – ${vndFmt(high)}/đêm`;
  if (low) return `${vndFmt(low)}/đêm`;
  return t('contact');
}

// ── API HELPERS ────────────────────────────────────────────────
async function callFn(name, body) {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify(body),
  });
  let data = {};
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

async function restGet(path, params = '') {
  const res = await fetch(`${REST_BASE}/${path}${params}`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`REST ${res.status}: ${errorText}`);
  }
  return res.json();
}

// ── UI HELPERS ─────────────────────────────────────────────────
function showMsg(id, type, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `msg ${type}`;
  el.innerHTML = html;
}
function hideMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'msg hidden';
  el.innerHTML = '';
}
function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = busy;
  if (busy) { btn.dataset.orig = btn.textContent; btn.textContent = t('msg-loading'); }
  else { btn.textContent = btn.dataset.orig || btn.textContent; }
}

function getStatusBadge(status) {
  const map = {
    confirmed:   ['badge-confirmed',   t('opt-confirmed')],
    checked_in:  ['badge-checked-in',  t('opt-checked-in')],
    checked_out: ['badge-checked-out', t('opt-checked-out')],
    cancelled:   ['badge-cancelled',   t('opt-cancelled')],
  };
  const [cls, label] = map[status] || ['badge-checked-out', status];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function getChannelBadge(sourceChannel) {
  const ch = String(sourceChannel || '').toLowerCase().trim();
  if (ch === 'ota_1' || ch.includes('vietstay')) {
    return `<span style="display:inline-block;padding:0.18rem 0.55rem;border-radius:3px;font-size:0.72rem;font-weight:600;background:#FEF0E6;color:#E07B39;border:1px solid rgba(224,123,57,0.3)">OTA 1 / VietStay</span>`;
  }
  if (ch === 'ota_2' || ch.includes('stayasia')) {
    return `<span style="display:inline-block;padding:0.18rem 0.55rem;border-radius:3px;font-size:0.72rem;font-weight:600;background:#E8F8EE;color:#27AE60;border:1px solid rgba(39,174,96,0.3)">OTA 2 / StayAsia</span>`;
  }
  return `<span style="display:inline-block;padding:0.18rem 0.55rem;border-radius:3px;font-size:0.72rem;font-weight:600;background:#F5EDD5;color:#8A7035;border:1px solid rgba(201,169,75,0.3)">Direct</span>`;
}

// ── LANGUAGE MANAGER ───────────────────────────────────────────
function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.title = lang === 'en'
    ? 'Staff Portal — Lua Vang Resort & Spa'
    : 'Cổng nhân viên — Lụa Vàng Resort & Spa';

  document.querySelectorAll('.lang-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.lang === lang));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.dataset.i18n);
    if (typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el =>
    { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el =>
    { el.placeholder = t(el.dataset.i18nPlaceholder); });

  const typeSel = document.getElementById('rate-room-type');
  if (typeSel && typeSel.options[0] && typeSel.options[0].value === "") {
    typeSel.options[0].textContent = t('select-type-opt');
  }

  if (!currentRoomTypeRate) {
    const cont = document.getElementById('rate-history-container');
    if (cont && cont.querySelector('.no-results')) {
      cont.innerHTML = `<div class="no-results">${t('select-type-first')}</div>`;
    }
  }

  try { localStorage.setItem('staff-lang', lang); } catch {}
}

function initLang() {
  document.getElementById('lang-toggle')?.addEventListener('click', e => {
    const opt = e.target.closest('.lang-opt');
    if (opt && opt.dataset.lang !== currentLang) applyLanguage(opt.dataset.lang);
  });
  let saved = 'vi';
  try { saved = localStorage.getItem('staff-lang') || 'vi'; } catch {}
  applyLanguage(saved);
}

// ── PIN AUTHENTICATION ─────────────────────────────────────────
function unlockStaffPortal() {
  const overlay = document.getElementById('pin-overlay');
  if (overlay) {
    overlay.style.setProperty('display', 'none', 'important');
    overlay.classList.add('hidden');
    try { overlay.remove(); } catch (err) { overlay.parentNode
