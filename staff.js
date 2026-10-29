/* ============================================================
   LỤA VÀNG RESORT & SPA — STAFF PORTAL
   staff.js  |  Production Grade PMS/CRS Logic
   ============================================================ */

const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;
const REST_BASE    = `${SUPABASE_URL}/rest/v1`;
const STAFF_PIN    = "2026";

// Danh mục 6 hạng phòng chuẩn
const DEFAULT_ROOM_TYPES = [
  "Deluxe Ocean View",
  "Deluxe Garden View",
  "Suite Lagoon View",
  "Lantern Pool Villa",
  "Oceanfront Villa",
  "Presidential Silk Villa"
];

// ── I18N ──────────────────────────────────────────────────────
const I18N = {
  vi: {
    'hotel-sub-staff':   'Resort &amp; Spa &ensp;·&ensp; Hệ thống quản trị tập trung',
    'pin-sub':           'Cổng quản trị nội bộ',
    'pin-btn':           'Đăng nhập',
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
    'btn-book':          'Xác nhận đặt phòng',
    'avail-tag':         'Tra cứu nhanh',
    'avail-h2':          'Kiểm tra tình trạng phòng theo giai đoạn',
    'btn-search':        'Kiểm tra',
    'rate-tag':          'Quản trị giá bán & Kênh phân phối',
    'rate-h2':           'Cập nhật giá bán cơ bản (Base Rate)',
    'label-room-type':   'Hạng phòng áp dụng',
    'label-base-rate':   'Giá cơ bản / đêm (VNĐ)',
    'label-changed-by':  'Bộ phận thực hiện',
    'btn-update-rate':   'Lưu thay đổi giá',
    'rate-preview-tag':  'Bảng giá phân phối tự động theo chính sách kênh',
    'rate-history-tag':  'Lịch sử điều chỉnh biểu giá',
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
    'msg-no-avail-rooms':'Hiện không có phòng trống cho khoảng thời gian này.',
    'msg-updating-rate': 'Đang đồng bộ biểu giá mới sang các kênh…',
    'msg-booking':       'Đang tiến hành tạo đơn đặt phòng…',
    'msg-book-success':  'Đã tạo đơn đặt phòng thành công.',
    'msg-conflict':      'Phòng đã có khách đặt trùng ngày (Xung đột trạng thái).',
    'no-history':        'Chưa có lịch sử thay đổi biểu giá cho hạng phòng này.',
    'loading-types':     'Đang tải danh mục phòng…',
    'select-type-first': 'Vui lòng chọn hạng phòng để xem bảng giá và lịch sử…',
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
    'btn-book':          'Confirm Reservation',
    'avail-tag':         'Quick Search',
    'avail-h2':          'Room Availability Status',
    'btn-search':        'Check',
    'rate-tag':          'Revenue & Channel Management',
    'rate-h2':           'Update Room Base Rates',
    'label-room-type':   'Room Category',
    'label-base-rate':   'Base Rate / Night (VND)',
    'label-changed-by':  'Updated By',
    'btn-update-rate':   'Apply Rate Change',
    'rate-preview-tag':  'Auto-calculated Channel Rates',
    'rate-history-tag':  'Rate Modification History',
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
    'msg-no-avail-rooms':'No rooms available for the selected dates.',
    'msg-updating-rate': 'Synchronizing new rates across channels…',
    'msg-booking':       'Creating reservation…',
    'msg-book-success':  'Reservation successfully created.',
    'msg-conflict':      'Room conflict detected (already reserved).',
    'no-history':        'No rate change history recorded for this room type.',
    'loading-types':     'Loading room categories…',
    'select-type-first': 'Select a room category to review pricing and logs…',
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
let nbSearchDates        = {};
let nbSelectedRoom       = null;

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

function getChannelBadge(ch) {
  const c = String(ch || '').toLowerCase().trim();
  if (c === 'ota_1' || c.includes('vietstay')) {
    return `<span style="display:inline-block;padding:0.18rem 0.55rem;border-radius:3px;font-size:0.72rem;font-weight:600;background:#FEF0E6;color:#E07B39;border:1px solid rgba(224,123,57,0.3)">OTA 1 · VietStay</span>`;
  }
  if (c === 'ota_2' || c.includes('stayasia')) {
    return `<span style="display:inline-block;padding:0.18rem 0.55rem;border-radius:3px;font-size:0.72rem;font-weight:600;background:#E8F8EE;color:#27AE60;border:1px solid rgba(39,174,96,0.3)">OTA 2 · StayAsia</span>`;
  }
  return `<span style="display:inline-block;padding:0.18rem 0.55rem;border-radius:3px;font-size:0.72rem;font-weight:600;background:#F5EDD5;color:#8A7035;border:1px solid rgba(201,169,75,0.3)">Direct Web</span>`;
}

// ── LANGUAGE ───────────────────────────────────────────────────
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
function showApp() {
  const overlay = document.getElementById('pin-overlay');
  if (overlay) overlay.classList.add('hidden');
  loadDashboardStats();
  loadRoomTypes();
  searchBookings();
}

function initPin() {
  const overlay = document.getElementById('pin-overlay');
  const input   = document.getElementById('pin-input');
  const card    = document.getElementById('pin-card');

  try { sessionStorage.removeItem('staff_auth'); } catch {}
  if (overlay) overlay.classList.remove('hidden');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }

  function attempt() {
    if ((input?.value || '').trim() === STAFF_PIN) {
      try { sessionStorage.setItem('staff_auth', STAFF_PIN); } catch {}
      showApp();
    } else {
      showMsg('pin-msg', 'error', currentLang === 'en' ? 'Invalid PIN code.' : 'Mã PIN không chính xác.');
      card?.classList.remove('shake');
      void card?.offsetWidth;
      card?.classList.add('shake');
      if (input) { input.value = ''; input.focus(); }
    }
  }

  document.getElementById('pin-btn')?.addEventListener('click', attempt);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    try { sessionStorage.removeItem('staff_auth'); } catch {}
    if (overlay) overlay.classList.remove('hidden');
    if (input) { input.value = ''; input.focus(); }
    hideMsg('pin-msg');
  });
}

// ── TABS ───────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${id}`)?.classList.add('active');
    });
  });
}

// ── DASHBOARD STATS ─────────────────────────────────────────────
async function loadDashboardStats() {
  const today = new Date().toISOString().split('T')[0];

  const results = await Promise.allSettled([
    restGet('booking', `?check_in=eq.${today}&status=eq.confirmed&select=booking_id`),
    restGet('booking', `?check_out=eq.${today}&status=in.(confirmed,checked_in)&select=booking_id`),
    restGet('booking', `?check_in=lte.${today}&check_out=gt.${today}&status=eq.confirmed&select=booking_id`),
    restGet('room', '?select=room_id')
  ]);

  const arrivals   = results[0].status === 'fulfilled' ? results[0].value : [];
  const departures = results[1].status === 'fulfilled' ? results[1].value : [];
  const occupied   = results[2].status === 'fulfilled' ? results[2].value : [];
  const allRooms   = results[3].status === 'fulfilled' ? results[3].value : [];

  const occCount   = Array.isArray(occupied) ? occupied.length : 0;
  const totalRooms = Array.isArray(allRooms) && allRooms.length > 0 ? allRooms.length : 180;

  document.getElementById('stat-arrivals').textContent   = Array.isArray(arrivals) ? arrivals.length : '0';
  document.getElementById('stat-departures').textContent = Array.isArray(departures) ? departures.length : '0';
  document.getElementById('stat-occupied').textContent   = occCount;
  document.getElementById('stat-available').textContent  = Math.max(0, totalRooms - occCount);
}

// ── TAB 1: QUẢN LÝ BOOKING ─────────────────────────────────────
async function searchBookings() {
  const name     = (document.getElementById('search-name')?.value     || '').trim();
  const dateFrom = document.getElementById('search-date-from')?.value || '';
  const dateTo   = document.getElementById('search-date-to')?.value   || '';
  const status   = document.getElementById('search-status')?.value    || '';

  showMsg('search-bookings-status', 'loading', t('msg-searching'));
  document.getElementById('bookings-table-container').innerHTML = '';

  let filterQuery = '';
  if (status)   filterQuery += `&status=eq.${status}`;
  if (dateFrom) filterQuery += `&check_in=gte.${dateFrom}`;
  if (dateTo)   filterQuery += `&check_out=lte.${dateTo}`;

  let rows = [];

  try {
    const raw = await restGet('booking', `?select=*&order=check_in.desc&limit=100${filterQuery}`);
    
    rows = (raw || []).map(b => {
      const guestName = b.guest_name 
                     || b.guest?.guest_name 
                     || b.guest_id 
                     || 'Khách lưu trú';
      
      let detectedChannel = 'direct';
      for (const [key, val] of Object.entries(b)) {
        if (/channel|source/i.test(key) && val) {
          detectedChannel = String(val).toLowerCase().trim();
          break;
        }
      }

      return {
        booking_id:     b.booking_id || b.id || '—',
        room_id:        b.room_id || '—',
        guest_name:     guestName,
        check_in:       b.check_in || '—',
        check_out:      b.check_out || '—',
        status:         b.status || 'confirmed',
        source_channel: detectedChannel,
      };
    });

  } catch (err) {
    showMsg('search-bookings-status', 'error', t('msg-connect-err', err.message));
    return;
  }

  if (name) {
    const q = name.toLowerCase();
    rows = rows.filter(b =>
      String(b.guest_name || '').toLowerCase().includes(q) ||
      String(b.booking_id || '').toLowerCase().includes(q) ||
      String(b.room_id    || '').toLowerCase().includes(q) ||
      String(b.source_channel || '').toLowerCase().includes(q)
    );
  }

  if (!rows.length) {
    showMsg('search-bookings-status', 'warning', t('msg-no-results'));
    return;
  }

  hideMsg('search-bookings-status');
  renderBookingsTable(rows);
}

function renderBookingsTable(rows) {
  const wrap = document.createElement('div');
  wrap.className = 'bookings-table-wrap';
  wrap.innerHTML = `
    <table class="bookings-table">
      <thead><tr>
        <th>${t('table-th-id')}</th>
        <th>${t('table-th-room')}</th>
        <th>${t('table-th-guest')}</th>
        <th>${t('table-th-checkin')}</th>
        <th>${t('table-th-checkout')}</th>
        <th>${t('table-th-channel')}</th>
        <th>${t('table-th-status')}</th>
        <th>${t('table-th-actions')}</th>
      </tr></thead>
      <tbody id="bookings-tbody"></tbody>
    </table>`;
  document.getElementById('bookings-table-container').appendChild(wrap);

  const tbody = document.getElementById('bookings-tbody');
  rows.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-id">${b.booking_id}</td>
      <td><strong>${b.room_id}</strong></td>
      <td>${b.guest_name}</td>
      <td>${b.check_in}</td>
      <td>${b.check_out}</td>
      <td>${getChannelBadge(b.source_channel)}</td>
      <td>${getStatusBadge(b.status)}</td>
      <td>${b.status === 'confirmed'
        ? `<button class="action-btn cancel-bk-btn" data-id="${b.booking_id}">Hủy</button>`
        : ''}
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.addEventListener('click', async e => {
    const btn = e.target.closest('.cancel-bk-btn');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!window.confirm(t('confirm-cancel', id))) return;
    btn.disabled = true; btn.textContent = '…';
    try {
      const { ok, data } = await callFn('cancel_booking', { booking_id: id });
      if (ok) {
        showMsg('search-bookings-status', 'success', t('msg-cancel-ok', id));
        searchBookings();
        loadDashboardStats();
      } else {
        showMsg('search-bookings-status', 'error', data.error || 'Lỗi xử lý');
        btn.disabled = false; btn.textContent = 'Hủy';
      }
    } catch (err) {
      showMsg('search-bookings-status', 'error', t('msg-connect-err', err.message));
      btn.disabled = false; btn.textContent = 'Hủy';
    }
  });
}

document.getElementById('search-bookings-btn')?.addEventListener('click', searchBookings);

// ── TAB 2: TẠO ĐẶT PHÒNG THỦ CÔNG ──────────────────────────────
(function() {
  const today = new Date().toISOString().split('T')[0];
  const ci = document.getElementById('nb-check-in');
  const co = document.getElementById('nb-check-out');
  if (!ci || !co) return;
  ci.min = today; co.min = today;
  ci.addEventListener('change', () => { co.min = ci.value; if (co.value && co.value <= ci.value) co.value = ''; });
})();

document.getElementById('nb-search-btn')?.addEventListener('click', async () => {
  const ci = document.getElementById('nb-check-in')?.value;
  const co = document.getElementById('nb-check-out')?.value;
  if (!ci || !co) { showMsg('nb-search-status', 'warning', t('msg-no-dates')); return; }
  nbSearchDates = { check_in: ci, check_out: co };
  nbSelectedRoom = null;
  document.getElementById('nb-rooms-container').innerHTML = '';
  document.getElementById('nb-book-form')?.classList.add('hidden');
  showMsg('nb-search-status', 'loading', t('msg-loading'));
  try {
    const { ok, data } = await callFn('check_availability', { check_in: ci, check_out: co });
    if (!ok) { showMsg('nb-search-status', 'error', data.error || 'Error'); return; }
    const rooms = data.available_rooms || [];
    if (!rooms.length) { showMsg('nb-search-status', 'warning', t('msg-no-avail-rooms')); return; }
    showMsg('nb-search-status', 'success', t('msg-found-rooms', rooms.length));
    const container = document.getElementById('nb-rooms-container');
    const list = document.createElement('div'); list.className = 'room-list';
    rooms.forEach(room => {
      const row = document.createElement('div'); row.className = 'room-row'; row.dataset.id = room.room_id;
      row.innerHTML = `
        <div class="room-info">
          <h4>${room.room_type} &mdash; <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
          <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} khách</div>
        </div>
        <div class="room-rate">${rateStr(room.rate_low, room.rate_high)}</div>
        <button class="btn-select" data-id="${room.room_id}">${t('btn-pick')}</button>`;
      list.appendChild(row);
    });
    container.appendChild(list);
    list.addEventListener('click', e => {
      const btn = e.target.closest('.btn-select'); if (!btn) return;
      const room = rooms.find(r => r.room_id === btn.dataset.id); if (!room) return;
      nbSelectedRoom = room;
      list.querySelectorAll('.room-row').forEach(r => r.classList.toggle('selected-row', r.dataset.id === room.room_id));
      const inp = document.getElementById('nb-selected-room');
      if (inp) { inp.value = room.room_id; inp.classList.add('has-value'); }
      document.getElementById('nb-book-form')?.classList.remove('hidden');
      document.getElementById('nb-book-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } catch (err) { showMsg('nb-search-status', 'error', t('msg-connect-err', err.message)); }
});

document.getElementById('nb-book-btn')?.addEventListener('click', async () => {
  const roomId = (document.getElementById('nb-selected-room')?.value || '').trim();
  const name   = (document.getElementById('nb-guest-name')?.value   || '').trim();
  const email  = (document.getElementById('nb-guest-email')?.value  || '').trim();
  const phone  = (document.getElementById('nb-guest-phone')?.value  || '').trim();
  const extra  = (document.getElementById('nb-extra-guests')?.value || '').trim();

  if (!roomId) { showMsg('nb-book-status', 'warning', t('msg-no-room-sel')); return; }
  if (!name)   { showMsg('nb-book-status', 'warning', t('msg-no-guest'));    return; }
  if (!nbSearchDates.check_in) { showMsg('nb-book-status', 'warning', t('msg-no-dates')); return; }

  const guests = [{ guest_name: name, email: email || null, phone: phone || null }];
  if (extra) {
    extra.split(/;|\n/).map(s => s.trim()).filter(Boolean).forEach(line => {
      const [n, em, ph] = line.split(',').map(s => s.trim());
      if (n) guests.push({ guest_name: n, email: em || null, phone: ph || null });
    });
  }

  setBusy('nb-book-btn', true);
  showMsg('nb-book-status', 'loading', t('msg-booking'));
  document.getElementById('nb-booking-result')?.classList.add('hidden');

  try {
    const { ok, status, data } = await callFn('create_booking', {
      room_id: roomId, check_in: nbSearchDates.check_in, check_out: nbSearchDates.check_out,
      source_channel: 'direct',
      guest_name: name, email: email || null, phone: phone || null,
      guest: guests[0], guests,
    });
    if (status === 409) { showMsg('nb-book-status', 'error', t('msg-conflict')); return; }
    if (!ok) { showMsg('nb-book-status', 'error', data.error || 'Error'); return; }
    showMsg('nb-book-status', 'success', t('msg-book-success'));
    const panel = document.getElementById('nb-booking-result');
    if (panel) {
      panel.innerHTML = `<div class="bp-label">${t('bp-label')}</div><div class="bp-code">${data.booking_id}</div>
        <div class="bp-detail">${roomId} · ${name} · ${nbSearchDates.check_in} → ${nbSearchDates.check_out}</div>`;
      panel.classList.remove('hidden');
    }
    loadDashboardStats();
    searchBookings();
  } catch (err) { showMsg('nb-book-status', 'error', t('msg-connect-err', err.message)); }
  finally { setBusy('nb-book-btn', false); }
});

// ── TAB 3: TRA CỨU NHANH PHÒNG TRỐNG ───────────────────────────
(function() {
  const today = new Date().toISOString().split('T')[0];
  const ci = document.getElementById('av-check-in'), co = document.getElementById('av-check-out');
  if (!ci || !co) return;
  ci.min = today; co.min = today;
  ci.addEventListener('change', () => { co.min = ci.value; if (co.value && co.value <= ci.value) co.value = ''; });
})();

document.getElementById('av-search-btn')?.addEventListener('click', async () => {
  const ci = document.getElementById('av-check-in')?.value;
  const co = document.getElementById('av-check-out')?.value;
  if (!ci || !co) { showMsg('av-status', 'warning', t('msg-no-dates')); return; }
  showMsg('av-status', 'loading', t('msg-loading'));
  document.getElementById('av-rooms-container').innerHTML = '';
  try {
    const { ok, data } = await callFn('check_availability', { check_in: ci, check_out: co });
    if (!ok) { showMsg('av-status', 'error', data.error || 'Error'); return; }
    const rooms = data.available_rooms || [];
    if (!rooms.length) { showMsg('av-status', 'warning', t('msg-no-avail-rooms')); return; }
    showMsg('av-status', 'success', t('msg-found-rooms', rooms.length));
    const container = document.getElementById('av-rooms-container');
    const list = document.createElement('div'); list.className = 'room-list';
    rooms.forEach(room => {
      const row = document.createElement('div'); row.className = 'room-row';
      row.innerHTML = `
        <div class="room-info">
          <h4>${room.room_type} &mdash; <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
          <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} khách</div>
        </div>
        <div class="room-rate">${rateStr(room.rate_low, room.rate_high)}</div>`;
      list.appendChild(row);
    });
    container.appendChild(list);
  } catch (err) { showMsg('av-status', 'error', t('msg-connect-err', err.message)); }
});

// ── TAB 4: QUẢN TRỊ BẢNG GIÁ (DATA BINDING CHUẨN V_CHANNEL_RATES) ───
async function loadRoomTypes() {
  const sel = document.getElementById('rate-room-type');
  if (!sel) return;
  sel.innerHTML = `<option value="">${t('loading-types')}</option>`;
  
  let types = [];
  try {
    const rows = await restGet('room', '?select=room_type');
    types = [...new Set((rows || []).map(r => r.room_type))].filter(Boolean).sort();
  } catch (err) {
    types = DEFAULT_ROOM_TYPES;
  }

  if (!types.length) types = DEFAULT_ROOM_TYPES;

  sel.innerHTML = `<option value="">${currentLang === 'en' ? 'Select room category…' : 'Chọn hạng phòng…'}</option>`;
  types.forEach(rt => {
    const opt = document.createElement('option');
    opt.value = rt; opt.textContent = rt;
    sel.appendChild(opt);
  });
}

function resetRateCards() {
  ['price-direct', 'price-ota1', 'price-ota2', 'price-gds'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '—';
  });
  const inp = document.getElementById('rate-base-input');
  if (inp) inp.value = '';
}

async function loadCurrentRates(roomType) {
  resetRateCards();
  if (!roomType) return;

  const inp = document.getElementById('rate-base-input');
  if (inp) inp.placeholder = 'Đang tải giá...';

  try {
    let baseRate = null;
    const channelMap = {
      direct: 'price-direct',
      ota_1:  'price-ota1',
      ota_2:  'price-ota2',
      gds:    'price-gds'
    };

    // 1. Ưu tiên lấy trực tiếp từ view v_channel_rates
    try {
      const rows = await restGet('v_channel_rates', `?room_type=eq.${encodeURIComponent(roomType)}`);
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          const chKey = String(r.channel || r.source_channel || r.channel_name || '').toLowerCase().trim();
          const elId = channelMap[chKey];
          const channelPrice = Number(r.computed_rate ?? r.rate ?? r.channel_rate ?? 0);
          if (elId && channelPrice > 0) {
            const el = document.getElementById(elId);
            if (el) el.textContent = vndFmt(channelPrice);
          }
          if (!baseRate && r.base_rate) {
            baseRate = Number(r.base_rate);
          }
        });

        if (baseRate && inp) {
          inp.value = baseRate;
          inp.placeholder = '4000000';
          return;
        }
      }
    } catch (vErr) {
      console.warn("Chưa truy vấn được v_channel_rates, chuyển sang tính từ rate_rule:", vErr.message);
    }

    // 2. Fallback tính từ rate_rule và base_rate thực tế
    const [rulesRes, roomsRes] = await Promise.allSettled([
      restGet('rate_rule', `?room_type=eq.${encodeURIComponent(roomType)}&select=*`),
      restGet('room', `?room_type=eq.${encodeURIComponent(roomType)}&select=rate_low&limit=1`)
    ]);

    const roomsData = roomsRes.status === 'fulfilled' ? roomsRes.value : [];
    const rulesData = rulesRes.status === 'fulfilled' ? rulesRes.value : [];

    baseRate = Number(roomsData?.[0]?.rate_low) || null;

    if (baseRate && inp) {
      inp.value = baseRate;
      inp.placeholder = '4000000';

      if (rulesData && rulesData.length > 0) {
        rulesData.forEach(r => {
          const chKey = String(r.channel || r.source_channel || '').toLowerCase().trim();
          const elId = channelMap[chKey];
          const mult = Number(r.multiplier || 1.0);
          if (elId) {
            document.getElementById(elId).textContent = vndFmt(Math.round(baseRate * mult));
          }
        });
      } else {
        document.getElementById('price-direct').textContent = vndFmt(Math.round(baseRate * 0.95));
        document.getElementById('price-ota1').textContent   = vndFmt(Math.round(baseRate * 1.05));
        document.getElementById('price-ota2').textContent   = vndFmt(Math.round(baseRate * 1.05));
        document.getElementById('price-gds').textContent    = vndFmt(baseRate);
      }
    } else {
      if (inp) inp.placeholder = 'Chưa có giá cơ sở';
    }

  } catch (err) {
    showMsg('rate-status', 'error', t('msg-connect-err', err.message));
    if (inp) inp.placeholder = 'Lỗi kết nối';
  }
}

document.getElementById('rate-room-type')?.addEventListener('change', async function() {
  const rt = this.value;
  currentRoomTypeRate = rt || null;
  hideMsg('rate-status');
  if (!rt) {
    resetRateCards();
    const container = document.getElementById('rate-history-container');
    if (container) {
      container.innerHTML = `<div class="no-results">${t('select-type-first')}</div>`;
    }
    return;
  }
  await Promise.all([loadCurrentRates(rt), loadRateHistory(rt)]);
});

document.getElementById('update-rate-btn')?.addEventListener('click', async () => {
  const roomType    = (document.getElementById('rate-room-type')?.value || '').trim();
  const newBaseRate = Number(document.getElementById('rate-base-input')?.value);

  if (!roomType) { showMsg('rate-status', 'warning', t('msg-no-type')); return; }
  if (!newBaseRate || newBaseRate < 100000) { showMsg('rate-status', 'warning', t('msg-no-rate')); return; }

  setBusy('update-rate-btn', true);
  showMsg('rate-status', 'loading', t('msg-updating-rate'));

  try {
    const { ok, data } = await callFn('update_base_rate', {
      room_type:     roomType,
      new_base_rate: newBaseRate,
      changed_by:    null
    });

    if (!ok) {
      showMsg('rate-status', 'error', data.error || t('msg-rate-error'));
      return;
    }

    showMsg('rate-status', 'success', t('msg-rate-success', roomType, newBaseRate));
    await Promise.all([loadCurrentRates(roomType), loadRateHistory(roomType)]);
  } catch (err) {
    showMsg('rate-status', 'error', t('msg-connect-err', err.message));
  } finally {
    setBusy('update-rate-btn', false);
  }
});

async function loadRateHistory(roomType) {
  const container = document.getElementById('rate-history-container');
  if (!container) return;
  container.innerHTML = `<div class="no-results">${t('msg-loading')}</div>`;
  try {
    const rows = await restGet('rate_history',
      `?room_type=eq.${encodeURIComponent(roomType)}&order=changed_at.desc&limit=20`);
    if (!rows?.length) {
      container.innerHTML = `<div class="no-results">${t('no-history')}</div>`;
      return;
    }
    const wrap = document.createElement('div'); wrap.className = 'bookings-table-wrap';
    wrap.innerHTML = `
      <table class="bookings-table">
        <thead><tr>
          <th>Hạng phòng</th><th>Giá cũ</th><th>Giá điều chỉnh</th><th>Thời gian cập nhật</th>
        </tr></thead>
        <tbody id="history-tbody"></tbody>
      </table>`;
    container.innerHTML = ''; container.appendChild(wrap);
    const tbody = document.getElementById('history-tbody');
    rows.forEach(r => {
      const d = r.changed_at ? new Date(r.changed_at).toLocaleString('vi-VN') : '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.room_type}</td>
        <td style="color:var(--muted)">${r.old_base_rate ? vndFmt(r.old_base_rate) : '—'}</td>
        <td style="color:var(--forest);font-weight:500">${r.new_base_rate ? vndFmt(r.new_base_rate) : '—'}</td>
        <td style="font-size:0.77rem;color:var(--muted)">${d}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    container.innerHTML = `<div class="no-results">${t('no-history')}</div>`;
  }
}

document.getElementById('refresh-history-btn')?.addEventListener('click', () => {
  if (currentRoomTypeRate) loadRateHistory(currentRoomTypeRate);
});

// ── INIT ───────────────────────────────────────────────────────
initPin();
initLang();
initTabs();
