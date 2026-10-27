/* ============================================================
   LỤA VÀNG RESORT & SPA — STAFF PORTAL
   staff.js (Updated with 4.2 Rate Management & 4.3 Guest Normalisation)
   ============================================================ */

const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;
const REST_BASE    = `${SUPABASE_URL}/rest/v1`;

const STAFF_PIN = "2026";

const I18N = {
  vi: {
    'hotel-sub-staff':    'Resort &amp; Spa &ensp;·&ensp; Cổng nhân viên',
    'pin-sub':            'Cổng nhân viên',
    'pin-placeholder':    '••••',
    'pin-btn':            'Đăng nhập',
    'pin-wrong':          'PIN không đúng. Vui lòng thử lại.',
    'btn-logout':         'Đăng xuất',
    'stat-arrivals':      'Đến hôm nay',
    'stat-departures':    'Rời hôm nay',
    'stat-occupied':      'Đang lưu trú',
    'stat-available':     'Phòng trống',
    'tab-bookings':       'Quản lý booking',
    'tab-new-booking':    'Tạo booking mới',
    'tab-availability':   'Kiểm tra phòng',
    'tab-rates':          'Quản lý giá (4.2)',
    'ph-search':          'Tên khách / Mã booking…',
    'opt-all-status':     'Tất cả trạng thái',
    'opt-confirmed':      'Đã đặt',
    'opt-checked-in':     'Đang ở',
    'opt-checked-out':    'Đã rời',
    'opt-cancelled':      'Đã hủy',
    'btn-search-bookings':'Tìm kiếm',
    'col-id':             'Mã booking',
    'col-room':           'Phòng',
    'col-guest':          'Tên khách',
    'col-checkin':        'Nhận phòng',
    'col-checkout':       'Trả phòng',
    'col-status':         'Trạng thái',
    'col-actions':        'Hành động',
    'btn-checkin':        'Check-in',
    'btn-checkout':       'Check-out',
    'btn-cancel-bk':      'Hủy',
    'badge-confirmed':    'Đã đặt',
    'badge-checked-in':   'Đang ở',
    'badge-checked-out':  'Đã rời',
    'badge-cancelled':    'Đã hủy',
    'new-bk-tag':         'Tạo booking thủ công',
    'new-bk-h2':          'Đặt phòng cho khách',
    'label-checkin':      'Ngày nhận phòng',
    'label-checkout':     'Ngày trả phòng',
    'btn-search-avail':   'Kiểm tra phòng trống',
    'label-room':         'Phòng đã chọn',
    'ph-room':            'Chọn phòng từ danh sách',
    'label-guest':        'Tên khách chính',
    'ph-guest':           'Họ và tên đầy đủ',
    'btn-book':           'Xác nhận đặt phòng',
    'avail-tag':          'Kiểm tra nhanh',
    'avail-h2':           'Phòng trống theo ngày',
    'btn-search':         'Kiểm tra',
    'btn-book-now':       'Đặt ngay',
    'rate-tag':           'Quản trị doanh thu · 4.2 Rate Consistency',
    'rate-h2':            'Staff Rate Management',
    'label-room-type':    'Loại phòng (Room Type)',
    'label-base-rate':    'Giá cơ bản (Base Rate — VNĐ)',
    'label-changed-by':   'Người cập nhật (Changed By)',
    'btn-update-rate':    'Update Rate',
    'rate-preview-tag':   'Bảng giá phân phối tự động theo kênh',
    'rate-history-tag':   'Lịch sử thay đổi giá (RateHistory)',
    'unit-guests':        'người',
    'unit-night':         'đêm',
    'contact':            'Liên hệ',
    'btn-pick':           'Chọn',
    'room-fallback':      'Phòng',
    'bp-label':           'Mã đặt phòng — lưu lại khi cần hủy',
    'btn-copy':           'Sao chép mã',
    'btn-copied':         'Đã sao chép ✓',
    'copy-prompt':        'Sao chép mã booking:',
    'footer-text':        'Lụa Vàng Resort & Spa · Hệ thống quản lý nội bộ · 2026',
    'msg-processing':     'Đang xử lý…',
    'msg-searching':      'Đang tìm kiếm…',
    'msg-no-bookings':    'Không tìm thấy booking nào phù hợp.',
    'msg-no-dates':       'Vui lòng chọn cả ngày nhận và trả phòng.',
    'msg-date-order':     'Ngày nhận phòng phải trước ngày trả phòng.',
    'msg-searching-rooms':'Đang kiểm tra phòng trống…',
    'msg-no-rooms':       'Không có phòng trống trong khoảng thời gian này.',
    'msg-no-room-sel':    'Chưa chọn phòng.',
    'msg-no-guest':       'Vui lòng nhập tên khách.',
    'msg-booking':        'Đang tạo đặt phòng…',
    'msg-book-success':   'Đặt phòng thành công. Lưu lại mã bên dưới.',
    'msg-conflict':       'Phòng vừa bị đặt trùng ngày (HTTP 409). Vui lòng chọn phòng khác.',
    'msg-booking-err':    'Không thể tạo booking. Thử lại sau.',
    'msg-checkin-ok':     'Check-in thành công.',
    'msg-checkout-ok':    'Check-out thành công.',
    'msg-backend-err':    'Không thể kết nối backend. Thử lại sau.',
    'msg-action-err':     'Thao tác thất bại. Kiểm tra endpoint hoặc thử lại.',
    'msg-found-rooms':    (n) => `Tìm thấy <strong>${n}</strong> phòng trống.`,
    'msg-connect-err':    (e) => `Lỗi kết nối: ${e}`,
    'msg-cancel-ok':      (id) => `Đã hủy thành công booking <strong>${id}</strong>.`,
    'confirm-checkin':    (id, name) => `Xác nhận check-in:\n\nBooking: ${id}\nKhách: ${name}`,
    'confirm-checkout':   (id) => `Xác nhận check-out:\n\nBooking: ${id}`,
    'confirm-cancel':     (id) => `Xác nhận hủy:\n\nBooking: ${id}\n\nKhông thể hoàn tác.`,
    'endpoint-note':      (fn) => `Endpoint <code>${fn}</code> chưa được triển khai.`,
  },
  en: {
    'hotel-sub-staff':    'Resort &amp; Spa &ensp;·&ensp; Staff Portal',
    'pin-sub':            'Staff Portal',
    'pin-placeholder':    '••••',
    'pin-btn':            'Sign in',
    'pin-wrong':          'Incorrect PIN. Please try again.',
    'btn-logout':         'Sign out',
    'stat-arrivals':      'Arrivals today',
    'stat-departures':    'Departures today',
    'stat-occupied':      'Occupied',
    'stat-available':     'Available',
    'tab-bookings':       'Manage Bookings',
    'tab-new-booking':    'New Booking',
    'tab-availability':   'Check Availability',
    'tab-rates':          'Rate Management (4.2)',
    'ph-search':          'Guest name / Booking ID…',
    'opt-all-status':     'All statuses',
    'opt-confirmed':      'Confirmed',
    'opt-checked-in':     'Checked in',
    'opt-checked-out':    'Checked out',
    'opt-cancelled':      'Cancelled',
    'btn-search-bookings':'Search',
    'col-id':             'Booking ID',
    'col-room':           'Room',
    'col-guest':          'Guest',
    'col-checkin':        'Check-in',
    'col-checkout':       'Check-out',
    'col-status':         'Status',
    'col-actions':        'Actions',
    'btn-checkin':        'Check-in',
    'btn-checkout':       'Check-out',
    'btn-cancel-bk':      'Cancel',
    'badge-confirmed':    'Confirmed',
    'badge-checked-in':   'Checked in',
    'badge-checked-out':  'Checked out',
    'badge-cancelled':    'Cancelled',
    'new-bk-tag':         'Manual Booking',
    'new-bk-h2':          'Book a Room for Guest',
    'label-checkin':      'Check-in Date',
    'label-checkout':     'Check-out Date',
    'btn-search-avail':   'Check Availability',
    'label-room':         'Selected Room',
    'ph-room':            'Select a room from the list',
    'label-guest':        'Primary Guest Name',
    'ph-guest':           'Full name',
    'btn-book':           'Confirm Booking',
    'avail-tag':          'Quick Check',
    'avail-h2':           'Available Rooms by Date',
    'btn-search':         'Check',
    'btn-book-now':       'Book now',
    'rate-tag':           'Revenue Management · 4.2 Rate Consistency',
    'rate-h2':            'Staff Rate Management',
    'label-room-type':    'Room Type',
    'label-base-rate':    'Base Rate (VND)',
    'label-changed-by':   'Changed By',
    'btn-update-rate':    'Update Rate',
    'rate-preview-tag':   'Automated Channel Rates',
    'rate-history-tag':   'Rate Change Log (RateHistory)',
    'unit-guests':        'guests',
    'unit-night':         'night',
    'contact':            'Contact us',
    'btn-pick':           'Select',
    'room-fallback':      'Room',
    'bp-label':           'Booking ID — save this for cancellation',
    'btn-copy':           'Copy ID',
    'btn-copied':         'Copied ✓',
    'copy-prompt':        'Copy your booking ID:',
    'footer-text':        'Lua Vang Resort & Spa · Internal Management System · 2026',
    'msg-processing':     'Processing…',
    'msg-searching':      'Searching…',
    'msg-no-bookings':    'No bookings found matching your search.',
    'msg-no-dates':       'Please select both check-in and check-out dates.',
    'msg-date-order':     'Check-in date must be before check-out date.',
    'msg-searching-rooms':'Checking availability…',
    'msg-no-rooms':       'No rooms available for this period.',
    'msg-no-room-sel':    'No room selected.',
    'msg-no-guest':       'Please enter the guest name.',
    'msg-booking':        'Creating your booking…',
    'msg-book-success':   'Booking confirmed. Please save the ID below.',
    'msg-conflict':       'This room was just booked for the same dates (HTTP 409).',
    'msg-booking-err':    'Unable to create booking. Please try again.',
    'msg-checkin-ok':     'Check-in successful.',
    'msg-checkout-ok':    'Check-out successful.',
    'msg-backend-err':    'Unable to connect to the server. Please try again.',
    'msg-action-err':     'Action failed. Check the endpoint or try again.',
    'msg-found-rooms':    (n) => `Found <strong>${n}</strong> available room${n !== 1 ? 's' : ''}.`,
    'msg-connect-err':    (e) => `Connection error: ${e}`,
    'msg-cancel-ok':      (id) => `Booking <strong>${id}</strong> successfully cancelled.`,
    'confirm-checkin':    (id, name) => `Confirm check-in:\n\nBooking: ${id}\nGuest: ${name}`,
    'confirm-checkout':   (id) => `Confirm check-out:\n\nBooking: ${id}`,
    'confirm-cancel':     (id) => `Confirm cancellation:\n\nBooking: ${id}\n\nThis cannot be undone.`,
    'endpoint-note':      (fn) => `Endpoint <code>${fn}</code> is not yet implemented.`,
  },
};

let currentLang    = 'vi';
let nbSearchDates  = { check_in: null, check_out: null };
let nbSelectedRoom = null;
let avLastRooms    = [];

function t(key, ...args) {
  const table = I18N[currentLang] || I18N.vi;
  const entry = (key in table) ? table[key]
              : (key in I18N.vi) ? I18N.vi[key]
              : key;
  return typeof entry === 'function' ? entry(...args) : entry;
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
  document.querySelectorAll('.lang-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  try { localStorage.setItem('staff-lang', lang); } catch { /* ignore */ }
}

async function callFn(name, body) {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
      "apikey":        ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty */ }
  return { ok: res.ok, status: res.status, data };
}

async function restGet(table, params = "") {
  const res = await fetch(`${REST_BASE}/${table}${params}`, {
    headers: {
      "apikey":        ANON_KEY,
      "Authorization": `Bearer ${ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`REST ${res.status}`);
  return res.json();
}

function showMsg(id, type, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `msg ${type}`;
  el.innerHTML = html;
}

function hideMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = "msg hidden";
  el.innerHTML = "";
}

function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = busy;
  if (busy) {
    btn.dataset.orig = btn.textContent;
    btn.textContent  = t('msg-processing');
  } else {
    btn.textContent = btn.dataset.orig || btn.textContent;
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function vnd(n) {
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

function rateStr(low, high) {
  const perNight = `/${t('unit-night')}`;
  if (low && high && String(low) !== String(high))
    return `${vnd(low)} – ${vnd(high)}${perNight}`;
  if (low) return `${vnd(low)}${perNight}`;
  return t('contact');
}

const ROOM_TYPE_MAP = {
  deluxe: "Deluxe", superior: "Superior", suite: "Suite",
  family: "Family", villa: "Villa", standard: "Standard",
};
function roomTypeName(type) {
  return ROOM_TYPE_MAP[(type || "").toLowerCase()] || (type || t('room-fallback'));
}

// ── AUTH ─────────────────────────────────────────────────────
function isAuthenticated() {
  try { return sessionStorage.getItem('staff-auth') === 'yes'; } catch { return false; }
}
function setAuthenticated() {
  try { sessionStorage.setItem('staff-auth', 'yes'); } catch { /* ignore */ }
}
function clearAuthenticated() {
  try { sessionStorage.removeItem('staff-auth'); } catch { /* ignore */ }
}
function showOverlay() {
  document.getElementById('pin-overlay').classList.remove('hidden');
  document.getElementById('staff-main').style.display = 'none';
  document.querySelector('footer').style.display = 'none';
}
function hideOverlay() {
  document.getElementById('pin-overlay').classList.add('hidden');
  document.getElementById('staff-main').style.display = '';
  document.querySelector('footer').style.display = '';
}

document.getElementById('pin-btn').addEventListener('click', handlePinSubmit);
document.getElementById('pin-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handlePinSubmit();
});

function handlePinSubmit() {
  const entered = (document.getElementById('pin-input').value || '').trim();
  if (entered === STAFF_PIN) {
    setAuthenticated();
    hideOverlay();
    document.getElementById('pin-input').value = '';
    hideMsg('pin-msg');
    onAuthenticated();
  } else {
    const card = document.getElementById('pin-card');
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    showMsg('pin-msg', 'error', t('pin-wrong'));
    document.getElementById('pin-input').select();
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  clearAuthenticated();
  showOverlay();
});

function onAuthenticated() {
  initDatePickers();
  loadStats();
  loadRateHistory();
}

// ── STATS ────────────────────────────────────────────────────
async function loadStats() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { ok, data } = await callFn('check_availability', {
      check_in: today,
      check_out: tomorrow.toISOString().split('T')[0],
    });
    if (ok) {
      document.getElementById('stat-available').textContent =
        (data.available_rooms || []).length;
    }
  } catch { /* ignore */ }

  try {
    const { ok, data } = await callFn('list_bookings', { limit: 500 });
    if (!ok) return;
    const bookings = data.bookings || [];
    document.getElementById('stat-arrivals').textContent   = bookings.filter(b => b.check_in === today && b.status === 'confirmed').length;
    document.getElementById('stat-departures').textContent = bookings.filter(b => b.check_out === today && b.status === 'checked_in').length;
    document.getElementById('stat-occupied').textContent   = bookings.filter(b => b.status === 'checked_in').length;
  } catch { /* ignore */ }
}

// ── TABS ─────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    if (btn.dataset.tab === 'rates') loadRateHistory();
  });
});

function switchToTab(tabName) {
  const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
  if (btn) btn.click();
}

// ── TAB 1: BOOKING MANAGEMENT ────────────────────────────────
document.getElementById('search-bookings-btn').addEventListener('click', searchBookings);

async function searchBookings() {
  const name     = (document.getElementById('search-name').value || '').trim();
  const dateFrom = document.getElementById('search-date-from').value;
  const dateTo   = document.getElementById('search-date-to').value;
  const status   = document.getElementById('search-status').value;

  setBusy('search-bookings-btn', true);
  showMsg('search-bookings-status', 'loading', t('msg-searching'));
  document.getElementById('bookings-table-container').innerHTML = '';

  try {
    const payload = { limit: 100 };
    if (name)     payload.guest_name = name;
    if (dateFrom) payload.date_from  = dateFrom;
    if (dateTo)   payload.date_to    = dateTo;
    if (status)   payload.status     = status;

    const { ok, status: httpStatus, data } = await callFn('list_bookings', payload);

    if (httpStatus === 404) {
      hideMsg('search-bookings-status');
      document.getElementById('bookings-table-container').innerHTML = `
        <div class="endpoint-note">${t('endpoint-note', 'list_bookings')}</div>
      `;
      return;
    }
    if (!ok) {
      showMsg('search-bookings-status', 'error', data.error || t('msg-backend-err'));
      return;
    }

    const bookings = data.bookings || [];
    if (!bookings.length) {
      showMsg('search-bookings-status', 'warning', t('msg-no-bookings'));
      return;
    }

    hideMsg('search-bookings-status');
    renderBookingsTable(bookings);
  } catch (err) {
    showMsg('search-bookings-status', 'error', t('msg-connect-err', err.message));
  } finally {
    setBusy('search-bookings-btn', false);
  }
}

function renderBookingsTable(bookings) {
  const container = document.getElementById('bookings-table-container');
  const wrap = document.createElement('div');
  wrap.className = 'bookings-table-wrap';

  wrap.innerHTML = `
    <table class="bookings-table">
      <thead>
        <tr>
          <th>${t('col-id')}</th>
          <th>${t('col-room')}</th>
          <th>${t('col-guest')}</th>
          <th>${t('col-checkin')}</th>
          <th>${t('col-checkout')}</th>
          <th>${t('col-status')}</th>
          <th>${t('col-actions')}</th>
        </tr>
      </thead>
      <tbody>
        ${bookings.map(renderBookingRow).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = '';
  container.appendChild(wrap);

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id, name: guestName } = btn.dataset;
    if (action === 'checkin')  handleCheckIn(id, guestName);
    if (action === 'checkout') handleCheckOut(id);
    if (action === 'cancel')   handleCancelBooking(id);
  });
}

function renderBookingRow(b) {
  const statusKey   = `badge-${b.status.replace(/_/g, '-')}`;
  const statusLabel = t(statusKey);
  const statusClass = `badge-${b.status.replace(/_/g, '-')}`;
  const shortId     = b.booking_id.substring(0, 10) + '…';
  const safeName    = escapeHtml(b.guest_name);

  let actions = '';
  if (b.status === 'confirmed') {
    actions = `
      <button class="action-btn checkin-btn" data-action="checkin" data-id="${b.booking_id}" data-name="${safeName}">${t('btn-checkin')}</button>
      <button class="action-btn cancel-small-btn" data-action="cancel" data-id="${b.booking_id}">${t('btn-cancel-bk')}</button>
    `;
  } else if (b.status === 'checked_in') {
    actions = `
      <button class="action-btn checkout-btn" data-action="checkout" data-id="${b.booking_id}">${t('btn-checkout')}</button>
    `;
  }

  return `
    <tr>
      <td><code class="bk-id" title="${b.booking_id}">${shortId}</code></td>
      <td>${escapeHtml(b.room_id)}</td>
      <td>${safeName}</td>
      <td>${b.check_in}</td>
      <td>${b.check_out}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td class="actions-cell">${actions}</td>
    </tr>
  `;
}

async function handleCheckIn(bookingId, guestName) {
  if (!confirm(t('confirm-checkin', bookingId, guestName))) return;
  showMsg('search-bookings-status', 'loading', t('msg-processing'));
  try {
    const { ok, status: httpStatus, data } = await callFn('update_booking_status', {
      booking_id: bookingId, status: 'checked_in',
    });
    if (httpStatus === 404) {
      showMsg('search-bookings-status', 'warning', t('endpoint-note', 'update_booking_status'));
      return;
    }
    if (!ok) {
      showMsg('search-bookings-status', 'error', data.error || t('msg-action-err'));
      return;
    }
    showMsg('search-bookings-status', 'success', t('msg-checkin-ok'));
    searchBookings();
    loadStats();
  } catch (err) {
    showMsg('search-bookings-status', 'error', t('msg-connect-err', err.message));
  }
}

async function handleCheckOut(bookingId) {
  if (!confirm(t('confirm-checkout', bookingId))) return;
  showMsg('search-bookings-status', 'loading', t('msg-processing'));
  try {
    const { ok, status: httpStatus, data } = await callFn('update_booking_status', {
      booking_id: bookingId, status: 'checked_out',
    });
    if (httpStatus === 404) {
      showMsg('search-bookings-status', 'warning', t('endpoint-note', 'update_booking_status'));
      return;
    }
    if (!ok) {
      showMsg('search-bookings-status', 'error', data.error || t('msg-action-err'));
      return;
    }
    showMsg('search-bookings-status', 'success', t('msg-checkout-ok'));
    searchBookings();
    loadStats();
  } catch (err) {
    showMsg('search-bookings-status', 'error', t('msg-connect-err', err.message));
  }
}

async function handleCancelBooking(bookingId) {
  if (!confirm(t('confirm-cancel', bookingId))) return;
  showMsg('search-bookings-status', 'loading', t('msg-processing'));
  try {
    const { ok, data } = await callFn('cancel_booking', {
      booking_id: bookingId,
      source_channel: 'direct',
    });
    if (!ok) {
      showMsg('search-bookings-status', 'error', data.error || t('msg-action-err'));
      return;
    }
    showMsg('search-bookings-status', 'success', t('msg-cancel-ok', bookingId));
    searchBookings();
    loadStats();
  } catch (err) {
    showMsg('search-bookings-status', 'error', t('msg-connect-err', err.message));
  }
}

// ── TAB 2: NEW BOOKING (With source_channel: "direct" & 4.3 Multi-Guest) ──
document.getElementById('nb-search-btn').addEventListener('click', nbSearchRooms);
document.getElementById('nb-book-btn').addEventListener('click', nbBook);

async function nbSearchRooms() {
  const checkIn  = document.getElementById('nb-check-in').value;
  const checkOut = document.getElementById('nb-check-out').value;

  if (!checkIn || !checkOut) { showMsg('nb-search-status', 'warning', t('msg-no-dates')); return; }
  if (checkIn >= checkOut)   { showMsg('nb-search-status', 'error', t('msg-date-order')); return; }

  nbSearchDates  = { check_in: checkIn, check_out: checkOut };
  nbSelectedRoom = null;
  document.getElementById('nb-selected-room').value = '';
  document.getElementById('nb-rooms-container').innerHTML = '';
  document.getElementById('nb-book-form').classList.add('hidden');

  setBusy('nb-search-btn', true);
  showMsg('nb-search-status', 'loading', t('msg-searching-rooms'));

  try {
    const { ok, data } = await callFn('check_availability', {
      check_in: checkIn, check_out: checkOut, source_channel: 'direct',
    });
    if (!ok) {
      showMsg('nb-search-status', 'error', data.error || t('msg-backend-err'));
      return;
    }
    const rooms = data.available_rooms || [];
    if (!rooms.length) {
      showMsg('nb-search-status', 'warning', t('msg-no-rooms'));
      return;
    }
    showMsg('nb-search-status', 'success', t('msg-found-rooms', rooms.length));
    nbRenderRooms(rooms);
  } catch (err) {
    showMsg('nb-search-status', 'error', t('msg-connect-err', err.message));
  } finally {
    setBusy('nb-search-btn', false);
  }
}

function nbRenderRooms(rooms) {
  const container = document.getElementById('nb-rooms-container');
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'room-list';
  list.style.marginTop = '1.2rem';

  rooms.forEach(room => {
    const row = document.createElement('div');
    row.className  = 'room-row';
    row.dataset.id = room.room_id;
    row.innerHTML = `
      <div class="room-info">
        <h4>${roomTypeName(room.room_type)} &mdash;
          <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
        <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} ${t('unit-guests')}</div>
      </div>
      <div class="room-rate">${rateStr(room.rate_low, room.rate_high)}</div>
      <button class="btn-select" data-id="${room.room_id}">${t('btn-pick')}</button>
    `;
    list.appendChild(row);
  });

  container.appendChild(list);
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-select');
    if (!btn) return;
    const room = rooms.find(r => r.room_id === btn.dataset.id);
    if (room) nbPickRoom(room, list);
  });
}

function nbPickRoom(room, listEl) {
  nbSelectedRoom = room;
  listEl.querySelectorAll('.room-row').forEach(r => {
    r.classList.toggle('selected-row', r.dataset.id === room.room_id);
  });
  const input = document.getElementById('nb-selected-room');
  input.value = room.room_id;
  input.classList.add('has-value');
  document.getElementById('nb-book-form').classList.remove('hidden');
  document.getElementById('nb-book-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function nbBook() {
  const roomId     = (document.getElementById('nb-selected-room').value || '').trim();
  const guestName  = (document.getElementById('nb-guest-name').value    || '').trim();
  const guestEmail = (document.getElementById('nb-guest-email')?.value  || '').trim();
  const guestPhone = (document.getElementById('nb-guest-phone')?.value  || '').trim();
  const extraRaw   = (document.getElementById('nb-extra-guests')?.value || '').trim();

  if (!roomId)    { showMsg('nb-book-status', 'warning', t('msg-no-room-sel')); return; }
  if (!guestName) { showMsg('nb-book-status', 'warning', t('msg-no-guest'));    return; }
  if (!nbSearchDates.check_in) { showMsg('nb-book-status', 'warning', t('msg-no-dates')); return; }

  const guests = [{
    guest_name: guestName,
    email: guestEmail || undefined,
    phone: guestPhone || undefined,
  }];

  if (extraRaw) {
    extraRaw.split(/\n|;/).map(s => s.trim()).filter(Boolean).forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts[0]) {
        guests.push({
          guest_name: parts[0],
          email: parts[1] || undefined,
          phone: parts[2] || undefined,
        });
      }
    });
  }

  setBusy('nb-book-btn', true);
  showMsg('nb-book-status', 'loading', t('msg-booking'));
  document.getElementById('nb-booking-result').classList.add('hidden');

  try {
    const { ok, status: httpStatus, data } = await callFn('create_booking', {
      room_id:        roomId,
      guest_name:     guestName,
      email:          guestEmail || undefined,
      phone:          guestPhone || undefined,
      guest:          guests[0],
      guests:         guests,
      check_in:       nbSearchDates.check_in,
      check_out:      nbSearchDates.check_out,
      source_channel: 'direct',
    });

    if (httpStatus === 409) { showMsg('nb-book-status', 'error', t('msg-conflict')); return; }
    if (!ok) { showMsg('nb-book-status', 'error', data.error || t('msg-booking-err')); return; }

    showMsg('nb-book-status', 'success', t('msg-book-success'));
    nbRenderBookingPanel(data.booking_id, roomId, guests.map(g => g.guest_name).join(', '),
      nbSearchDates.check_in, nbSearchDates.check_out);
    loadStats();
  } catch (err) {
    showMsg('nb-book-status', 'error', t('msg-connect-err', err.message));
  } finally {
    setBusy('nb-book-btn', false);
  }
}

function nbRenderBookingPanel(bookingId, roomId, guestName, checkIn, checkOut) {
  const panel = document.getElementById('nb-booking-result');
  panel.innerHTML = `
    <div class="bp-label">${t('bp-label')}</div>
    <div class="bp-code">${bookingId}</div>
    <div class="bp-detail">${roomId} · ${escapeHtml(guestName)} · ${checkIn} → ${checkOut} · <strong>Direct</strong></div>
    <button class="btn-copy" id="nb-copy-btn">${t('btn-copy')}</button>
  `;
  panel.classList.remove('hidden');

  document.getElementById('nb-copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(bookingId)
      .then(() => {
        const btn = document.getElementById('nb-copy-btn');
        btn.textContent = t('btn-copied');
        setTimeout(() => { btn.textContent = t('btn-copy'); }, 2200);
      })
      .catch(() => prompt(t('copy-prompt'), bookingId));
  });
}

// ── TAB 3: AVAILABILITY ──────────────────────────────────────
document.getElementById('av-search-btn').addEventListener('click', avSearch);

async function avSearch() {
  const checkIn  = document.getElementById('av-check-in').value;
  const checkOut = document.getElementById('av-check-out').value;

  if (!checkIn || !checkOut) { showMsg('av-status', 'warning', t('msg-no-dates')); return; }
  if (checkIn >= checkOut)   { showMsg('av-status', 'error', t('msg-date-order')); return; }

  setBusy('av-search-btn', true);
  showMsg('av-status', 'loading', t('msg-searching-rooms'));
  document.getElementById('av-rooms-container').innerHTML = '';
  avLastRooms = [];

  try {
    const { ok, data } = await callFn('check_availability', {
      check_in: checkIn, check_out: checkOut,
    });
    if (!ok) {
      showMsg('av-status', 'error', data.error || t('msg-backend-err'));
      return;
    }
    const rooms = data.available_rooms || [];
    avLastRooms = rooms;
    if (!rooms.length) {
      showMsg('av-status', 'warning', t('msg-no-rooms'));
      return;
    }
    showMsg('av-status', 'success', t('msg-found-rooms', rooms.length));
    avRenderRooms(rooms, checkIn, checkOut);
  } catch (err) {
    showMsg('av-status', 'error', t('msg-connect-err', err.message));
  } finally {
    setBusy('av-search-btn', false);
  }
}

function avRenderRooms(rooms, checkIn, checkOut) {
  const container = document.getElementById('av-rooms-container');
  container.innerHTML = '';
  const list = document.createElement('div');
  list.className = 'room-list';
  list.style.marginTop = '1.2rem';

  rooms.forEach(room => {
    const row = document.createElement('div');
    row.className  = 'room-row';
    row.dataset.id = room.room_id;
    row.innerHTML = `
      <div class="room-info">
        <h4>${roomTypeName(room.room_type)} &mdash;
          <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
        <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} ${t('unit-guests')}</div>
      </div>
      <div class="room-rate">${rateStr(room.rate_low, room.rate_high)}</div>
      <button class="btn-select book-now-btn" data-id="${room.room_id}">${t('btn-book-now')}</button>
    `;
    list.appendChild(row);
  });

  container.appendChild(list);
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.book-now-btn');
    if (!btn) return;
    const room = avLastRooms.find(r => r.room_id === btn.dataset.id);
    if (room) switchToNewBookingWith(room, checkIn, checkOut);
  });
}

function switchToNewBookingWith(room, checkIn, checkOut) {
  switchToTab('new-booking');
  document.getElementById('nb-check-in').value  = checkIn;
  document.getElementById('nb-check-out').value = checkOut;
  nbSearchDates  = { check_in: checkIn, check_out: checkOut };
  nbRenderRooms([room]);
  showMsg('nb-search-status', 'success', t('msg-found-rooms', 1));
  nbSelectedRoom = room;
  const input = document.getElementById('nb-selected-room');
  input.value = room.room_id;
  input.classList.add('has-value');
  document.getElementById('nb-book-form').classList.remove('hidden');
  document.getElementById('nb-guest-name').focus();
}

// ══════════════════════════════════════════════════════════════
//  TAB 4 — STAFF RATE MANAGEMENT (4.2 Rate Consistency)
// ══════════════════════════════════════════════════════════════

function renderCalculatedRates(baseRate, channelData = null) {
  const base = Number(baseRate) || 0;
  // Ưu tiên lấy giá từ phản hồi backend của Bảo Yến, nếu không có thì tính theo đúng công thức multiplier
  const directVal = channelData?.direct ?? channelData?.Direct ?? Math.round(base * 0.95);
  const ota1Val   = channelData?.ota_1  ?? channelData?.OTA1   ?? Math.round(base * 1.05);
  const ota2Val   = channelData?.ota_2  ?? channelData?.OTA2   ?? Math.round(base * 1.05);
  const gdsVal    = channelData?.gds    ?? channelData?.GDS    ?? Math.round(base * 1.00);

  document.getElementById('price-direct').textContent = vnd(directVal);
  document.getElementById('price-ota1').textContent   = vnd(ota1Val);
  document.getElementById('price-ota2').textContent   = vnd(ota2Val);
  document.getElementById('price-gds').textContent    = vnd(gdsVal);
}

// Xem trước trực tiếp khi nhân viên gõ Base Rate
document.getElementById('rate-base-input').addEventListener('input', (e) => {
  renderCalculatedRates(e.target.value);
});

document.getElementById('update-rate-btn').addEventListener('click', handleUpdateBaseRate);
document.getElementById('refresh-history-btn').addEventListener('click', loadRateHistory);

async function handleUpdateBaseRate() {
  const roomType    = document.getElementById('rate-room-type').value;
  const newBaseRate = Number(document.getElementById('rate-base-input').value);
  const changedBy   = (document.getElementById('rate-changed-by').value || 'staff_admin').trim();

  if (!newBaseRate || newBaseRate <= 0) {
    showMsg('rate-status', 'warning', 'Vui lòng nhập Base Rate hợp lệ (> 0).');
    return;
  }

  setBusy('update-rate-btn', true);
  showMsg('rate-status', 'loading', 'Đang cập nhật Base Rate và tính giá các kênh…');

  try {
    const { ok, data } = await callFn('update_base_rate', {
      room_type:     roomType,
      new_base_rate: newBaseRate,
      changed_by:    changedBy,
    });

    if (!ok) {
      showMsg('rate-status', 'error', data.error || 'Không thể cập nhật giá. Kiểm tra function update_base_rate.');
      return;
    }

    // Hiển thị giá 4 kênh từ kết quả trả về của Backend (hoặc fallback multiplier)
    const ratesObj = data.rates || data.channel_rates || data;
    renderCalculatedRates(newBaseRate, ratesObj);

    showMsg('rate-status', 'success',
      `Đã cập nhật Base Rate cho hạng phòng <strong>${escapeHtml(roomType)}</strong> thành <strong>${vnd(newBaseRate)}</strong>.`);

    // Tải lại bảng RateHistory
    await loadRateHistory();
  } catch (err) {
    showMsg('rate-status', 'error', `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy('update-rate-btn', false);
  }
}

async function loadRateHistory() {
  const container = document.getElementById('rate-history-container');
  if (!container) return;

  try {
    const rows = await restGet(
      'rate_history',
      '?select=room_type,old_base_rate,new_base_rate,changed_by,changed_at&order=changed_at.desc&limit=20'
    );

    if (!rows || rows.length === 0) {
      container.innerHTML = `<div class="no-results">Chưa có bản ghi lịch sử đổi giá nào trong RateHistory.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="bookings-table-wrap">
        <table class="bookings-table">
          <thead>
            <tr>
              <th>Loại phòng</th>
              <th>Giá gốc cũ (Old Base)</th>
              <th>Giá gốc mới (New Base)</th>
              <th>Người đổi (Changed By)</th>
              <th>Thời gian (Changed At)</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${escapeHtml(roomTypeName(r.room_type))}</strong></td>
                <td>${r.old_base_rate != null ? vnd(r.old_base_rate) : '—'}</td>
                <td style="color:var(--forest);font-weight:500">${vnd(r.new_base_rate)}</td>
                <td>${escapeHtml(r.changed_by || 'staff')}</td>
                <td>${r.changed_at ? new Date(r.changed_at).toLocaleString('vi-VN') : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="endpoint-note">Bảng <code>rate_history</code> chưa có dữ liệu hoặc chưa bật quyền đọc (RLS SELECT) trên Supabase.</div>`;
  }
}

function initDatePickers() {
  const today = new Date().toISOString().split('T')[0];
  [
    ['nb-check-in', 'nb-check-out'],
    ['av-check-in', 'av-check-out'],
  ].forEach(([ciId, coId]) => {
    const ci = document.getElementById(ciId);
    const co = document.getElementById(coId);
    if (!ci || !co) return;
    ci.min = today;
    co.min = today;
    ci.addEventListener('change', () => {
      co.min = ci.value;
      if (co.value && co.value <= ci.value) co.value = '';
    });
  });
}

(function init() {
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      const opt = e.target.closest('.lang-opt');
      if (!opt) return;
      const newLang = opt.dataset.lang;
      if (newLang && newLang !== currentLang) applyLanguage(newLang);
    });
  }
  let initLang = 'vi';
  try {
    const saved = localStorage.getItem('staff-lang');
    if (saved === 'en' || saved === 'vi') initLang = saved;
  } catch { /* ignore */ }
  applyLanguage(initLang);

  if (isAuthenticated()) {
    hideOverlay();
    onAuthenticated();
  } else {
    showOverlay();
  }
})();