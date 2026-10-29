/* ============================================================
   LỤA VÀNG RESORT & SPA — STAFF PORTAL
   staff.js  |  Full wiring: 4.2 Rate, Dashboard, Booking Mgmt
   ============================================================ */

const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;
const REST_BASE    = `${SUPABASE_URL}/rest/v1`;
const STAFF_PIN    = "2026";

// ── I18N ──────────────────────────────────────────────────────
const I18N = {
  vi: {
    'hotel-sub-staff':   'Resort &amp; Spa &ensp;·&ensp; Cổng nhân viên',
    'pin-sub':           'Cổng nhân viên',
    'pin-btn':           'Đăng nhập',
    'btn-logout':        'Đăng xuất',
    'stat-arrivals':     'Đến hôm nay',
    'stat-departures':   'Rời hôm nay',
    'stat-occupied':     'Đang lưu trú',
    'stat-available':    'Phòng trống',
    'tab-bookings':      'Quản lý booking',
    'tab-new-booking':   'Tạo booking mới',
    'tab-availability':  'Kiểm tra phòng',
    'tab-rates':         'Quản lý giá (4.2)',
    'ph-search':         'Tên khách / Mã booking…',
    'opt-all-status':    'Tất cả trạng thái',
    'opt-confirmed':     'Đã đặt',
    'opt-checked-in':    'Đang ở',
    'opt-checked-out':   'Đã rời',
    'opt-cancelled':     'Đã hủy',
    'btn-search-bookings':'Tìm kiếm',
    'new-bk-tag':        'Tạo booking thủ công',
    'new-bk-h2':         'Đặt phòng cho khách',
    'label-checkin':     'Ngày nhận phòng',
    'label-checkout':    'Ngày trả phòng',
    'btn-search-avail':  'Kiểm tra phòng trống',
    'label-room':        'Phòng đã chọn',
    'label-guest':       'Tên khách chính',
    'ph-guest':          'Họ và tên đầy đủ',
    'ph-room':           'Chọn phòng từ danh sách',
    'btn-book':          'Xác nhận đặt phòng',
    'avail-tag':         'Kiểm tra nhanh',
    'avail-h2':          'Phòng trống theo ngày',
    'btn-search':        'Kiểm tra',
    'rate-tag':          'Quản trị doanh thu · 4.2 Rate Consistency',
    'rate-h2':           'Staff Rate Management',
    'label-room-type':   'Loại phòng',
    'label-base-rate':   'Base Rate (VNĐ)',
    'label-changed-by':  'Người cập nhật (UI only)',
    'btn-update-rate':   'Update Rate',
    'rate-preview-tag':  'Bảng giá phân phối tự động theo kênh',
    'rate-history-tag':  'Lịch sử thay đổi giá (RateHistory)',
    'footer-text':       'Lụa Vàng Resort & Spa · Hệ thống quản lý nội bộ · 2026',
    'bp-label':          'Mã đặt phòng — lưu lại để dùng khi cần hủy',
    'btn-copy':          'Sao chép mã',
    'btn-copied':        'Đã sao chép ✓',
    'table-th-id':       'Booking ID',
    'table-th-room':     'Phòng',
    'table-th-guest':    'Khách',
    'table-th-checkin':  'Nhận phòng',
    'table-th-checkout': 'Trả phòng',
    'table-th-status':   'Trạng thái',
    'table-th-channel':  'Kênh',
    'table-th-actions':  'Thao tác',
    'btn-pick':          'Chọn',
    'contact':           'Liên hệ',
    'msg-loading':       'Đang tải…',
    'msg-searching':     'Đang tìm kiếm…',
    'msg-no-results':    'Không tìm thấy kết quả.',
    'msg-no-dates':      'Vui lòng chọn ngày.',
    'msg-no-room-sel':   'Chưa chọn phòng.',
    'msg-no-guest':      'Vui lòng nhập tên khách.',
    'msg-no-type':       'Vui lòng chọn loại phòng.',
    'msg-no-rate':       'Vui lòng nhập giá hợp lệ (≥ 100,000).',
    'msg-no-avail-rooms':'Không có phòng trống.',
    'msg-updating-rate': 'Đang cập nhật giá…',
    'msg-booking':       'Đang tạo đặt phòng…',
    'msg-book-success':  'Đặt phòng thành công.',
    'msg-conflict':      'Phòng đã có người đặt trùng ngày (HTTP 409).',
    'no-history':        'Chưa có lịch sử thay đổi.',
    'loading-types':     'Đang tải…',
    'select-type-first': 'Chọn loại phòng để xem giá…',
    'msg-rate-error':    'Không thể cập nhật giá. Kiểm tra backend.',
    'msg-found-rooms':   (n) => `Tìm thấy <strong>${n}</strong> phòng trống.`,
    'msg-connect-err':   (e) => `Lỗi kết nối: ${e}`,
    'msg-rate-success':  (rt, r) => `Đã cập nhật Base Rate <strong>${rt}</strong> thành <strong>${vndFmt(r)}</strong>.`,
    'msg-cancel-ok':     (id) => `Đã hủy booking <strong>${id}</strong>.`,
    'confirm-cancel':    (id) => `Xác nhận hủy:\n\n${id}\n\nKhông thể hoàn tác.`,
  },
  en: {
    'hotel-sub-staff':   'Resort &amp; Spa &ensp;·&ensp; Staff Portal',
    'pin-sub':           'Staff Portal',
    'pin-btn':           'Sign In',
    'btn-logout':        'Sign Out',
    'stat-arrivals':     'Arrivals Today',
    'stat-departures':   'Departures Today',
    'stat-occupied':     'Occupied',
    'stat-available':    'Available Rooms',
    'tab-bookings':      'Manage Bookings',
    'tab-new-booking':   'New Booking',
    'tab-availability':  'Check Availability',
    'tab-rates':         'Rate Management (4.2)',
    'ph-search':         'Guest name / Booking ID…',
    'opt-all-status':    'All statuses',
    'opt-confirmed':     'Confirmed',
    'opt-checked-in':    'Checked in',
    'opt-checked-out':   'Checked out',
    'opt-cancelled':     'Cancelled',
    'btn-search-bookings':'Search',
    'new-bk-tag':        'Manual booking',
    'new-bk-h2':         'Book a Room',
    'label-checkin':     'Check-in Date',
    'label-checkout':    'Check-out Date',
    'btn-search-avail':  'Check Availability',
    'label-room':        'Selected Room',
    'label-guest':       'Guest Name',
    'ph-guest':          'Full name',
    'ph-room':           'Select room from list',
    'btn-book':          'Confirm Booking',
    'avail-tag':         'Quick Check',
    'avail-h2':          'Available Rooms by Date',
    'btn-search':        'Check',
    'rate-tag':          'Revenue Management · 4.2 Rate Consistency',
    'rate-h2':           'Staff Rate Management',
    'label-room-type':   'Room Type',
    'label-base-rate':   'Base Rate (VND)',
    'label-changed-by':  'Changed By (UI only)',
    'btn-update-rate':   'Update Rate',
    'rate-preview-tag':  'Auto-calculated channel rates',
    'rate-history-tag':  'Rate Change Log (RateHistory)',
    'footer-text':       'Lua Vang Resort & Spa · Internal Management System · 2026',
    'bp-label':          'Booking ID — save this to use when cancelling',
    'btn-copy':          'Copy ID',
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
    'msg-no-results':    'No results found.',
    'msg-no-dates':      'Please select dates.',
    'msg-no-room-sel':   'No room selected.',
    'msg-no-guest':      'Please enter the guest name.',
    'msg-no-type':       'Please select a room type.',
    'msg-no-rate':       'Please enter a valid rate (≥ 100,000).',
    'msg-no-avail-rooms':'No rooms available.',
    'msg-updating-rate': 'Updating rate…',
    'msg-booking':       'Creating booking…',
    'msg-book-success':  'Booking confirmed.',
    'msg-conflict':      'Room already booked for these dates (HTTP 409).',
    'no-history':        'No history yet.',
    'loading-types':     'Loading…',
    'select-type-first': 'Select a room type to view rates…',
    'msg-rate-error':    'Could not update rate. Check backend.',
    'msg-found-rooms':   (n) => `Found <strong>${n}</strong> available room${n !== 1 ? 's' : ''}.`,
    'msg-connect-err':   (e) => `Connection error: ${e}`,
    'msg-rate-success':  (rt, r) => `Updated Base Rate for <strong>${rt}</strong> to <strong>${vndFmt(r)}</strong>.`,
    'msg-cancel-ok':     (id) => `Booking <strong>${id}</strong> cancelled.`,
    'confirm-cancel':    (id) => `Confirm cancellation:\n\n${id}\n\nThis cannot be undone.`,
  },
};

// ── STATE ──────────────────────────────────────────────────────
let currentLang          = 'vi';
let currentRoomTypeRate  = null;
let nbSearchDates        = {};
let nbSelectedRoom       = null;

// ── TRANSLATE ──────────────────────────────────────────────────
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

// ── API ────────────────────────────────────────────────────────
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
  if (!res.ok) throw new Error(`REST ${res.status}: ${path}`);
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

// ── PIN GATE ───────────────────────────────────────────────────
function showApp() {
  document.getElementById('pin-overlay')?.classList.add('hidden');
  loadDashboardStats();
  loadRoomTypes();
}

function initPin() {
  try { if (sessionStorage.getItem('staff_auth') === STAFF_PIN) { showApp(); return; } } catch {}

  const input = document.getElementById('pin-input');
  const card  = document.getElementById('pin-card');

  function attempt() {
    if ((input?.value || '').trim() === STAFF_PIN) {
      try { sessionStorage.setItem('staff_auth', STAFF_PIN); } catch {}
      showApp();
    } else {
      showMsg('pin-msg', 'error',
        currentLang === 'en' ? 'Incorrect code.' : 'Mã không đúng.');
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
    location.reload();
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
  try {
    const [arrivals, departures, occupied, allRooms] = await Promise.all([
      restGet('booking', `?check_in=eq.${today}&status=eq.confirmed&select=booking_id`),
      restGet('booking', `?check_out=eq.${today}&status=in.(confirmed,checked_in)&select=booking_id`),
      restGet('booking', `?check_in=lte.${today}&check_out=gt.${today}&status=eq.confirmed&select=booking_id`),
      restGet('room', '?select=room_id'),
    ]);
    const occ   = occupied?.length  || 0;
    const total = allRooms?.length  || 0;
    document.getElementById('stat-arrivals').textContent   = arrivals?.length  ?? '—';
    document.getElementById('stat-departures').textContent = departures?.length ?? '—';
    document.getElementById('stat-occupied').textContent   = occ;
    document.getElementById('stat-available').textContent  = total - occ;
  } catch {
    // Keep dashes — don't crash
  }
}

// ── TAB 1: BOOKING MANAGEMENT ──────────────────────────────────
async function searchBookings() {
  const name     = (document.getElementById('search-name')?.value     || '').trim();
  const dateFrom = document.getElementById('search-date-from')?.value || '';
  const dateTo   = document.getElementById('search-date-to')?.value   || '';
  const status   = document.getElementById('search-status')?.value    || '';

  showMsg('search-bookings-status', 'loading', t('msg-searching'));
  document.getElementById('bookings-table-container').innerHTML = '';

  try {
    let params = '?select=booking_id,room_id,guest_name,check_in,check_out,status,source_channel'
               + '&order=check_in.desc&limit=60';
    if (status)   params += `&status=eq.${status}`;
    if (dateFrom) params += `&check_in=gte.${dateFrom}`;
    if (dateTo)   params += `&check_out=lte.${dateTo}`;

    let rows = await restGet('booking', params);
    if (name) {
      const q = name.toLowerCase();
      rows = rows.filter(b =>
        (b.guest_name  || '').toLowerCase().includes(q) ||
        (b.booking_id  || '').toLowerCase().includes(q));
    }

    if (!rows.length) { showMsg('search-bookings-status', 'warning', t('msg-no-results')); return; }
    hideMsg('search-bookings-status');
    renderBookingsTable(rows);
  } catch (err) { showMsg('search-bookings-status', 'error', t('msg-connect-err', err.message)); }
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
      <td>${b.room_id}</td>
      <td>${b.guest_name || '—'}</td>
      <td>${b.check_in}</td>
      <td>${b.check_out}</td>
      <td style="font-size:0.74rem;color:var(--muted)">${b.source_channel || 'direct'}</td>
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
      if (ok) { showMsg('search-bookings-status','success',t('msg-cancel-ok',id)); searchBookings(); loadDashboardStats(); }
      else { showMsg('search-bookings-status','error',data.error||'Error'); btn.disabled=false; btn.textContent='Hủy'; }
    } catch (err) { showMsg('search-bookings-status','error',t('msg-connect-err',err.message)); btn.disabled=false; btn.textContent='Hủy'; }
  });
}

document.getElementById('search-bookings-btn')?.addEventListener('click', searchBookings);

// ── TAB 2: NEW BOOKING ─────────────────────────────────────────
(function() {
  const today = new Date().toISOString().split('T')[0];
  const ci = document.getElementById('nb-check-in');
  const co = document.getElementById('nb-check-out');
  if (!ci||!co) return;
  ci.min = today; co.min = today;
  ci.addEventListener('change', () => { co.min=ci.value; if(co.value&&co.value<=ci.value) co.value=''; });
})();

document.getElementById('nb-search-btn')?.addEventListener('click', async () => {
  const ci = document.getElementById('nb-check-in')?.value;
  const co = document.getElementById('nb-check-out')?.value;
  if (!ci||!co) { showMsg('nb-search-status','warning',t('msg-no-dates')); return; }
  nbSearchDates = { check_in: ci, check_out: co };
  nbSelectedRoom = null;
  document.getElementById('nb-rooms-container').innerHTML = '';
  document.getElementById('nb-book-form')?.classList.add('hidden');
  showMsg('nb-search-status','loading',t('msg-loading'));
  try {
    const { ok, data } = await callFn('check_availability', { check_in: ci, check_out: co });
    if (!ok) { showMsg('nb-search-status','error',data.error||'Error'); return; }
    const rooms = data.available_rooms || [];
    if (!rooms.length) { showMsg('nb-search-status','warning',t('msg-no-avail-rooms')); return; }
    showMsg('nb-search-status','success',t('msg-found-rooms',rooms.length));
    const container = document.getElementById('nb-rooms-container');
    const list = document.createElement('div'); list.className='room-list';
    rooms.forEach(room => {
      const row = document.createElement('div'); row.className='room-row'; row.dataset.id=room.room_id;
      row.innerHTML=`
        <div class="room-info">
          <h4>${room.room_type} &mdash; <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
          <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} người</div>
        </div>
        <div class="room-rate">${rateStr(room.rate_low,room.rate_high)}</div>
        <button class="btn-select" data-id="${room.room_id}">${t('btn-pick')}</button>`;
      list.appendChild(row);
    });
    container.appendChild(list);
    list.addEventListener('click', e => {
      const btn = e.target.closest('.btn-select'); if(!btn) return;
      const room = rooms.find(r=>r.room_id===btn.dataset.id); if(!room) return;
      nbSelectedRoom = room;
      list.querySelectorAll('.room-row').forEach(r=>r.classList.toggle('selected-row',r.dataset.id===room.room_id));
      const inp = document.getElementById('nb-selected-room');
      if(inp){inp.value=room.room_id;inp.classList.add('has-value');}
      document.getElementById('nb-book-form')?.classList.remove('hidden');
      document.getElementById('nb-book-form')?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  } catch (err) { showMsg('nb-search-status','error',t('msg-connect-err',err.message)); }
});

document.getElementById('nb-book-btn')?.addEventListener('click', async () => {
  const roomId = (document.getElementById('nb-selected-room')?.value||'').trim();
  const name   = (document.getElementById('nb-guest-name')?.value   ||'').trim();
  const email  = (document.getElementById('nb-guest-email')?.value  ||'').trim();
  const phone  = (document.getElementById('nb-guest-phone')?.value  ||'').trim();
  const extra  = (document.getElementById('nb-extra-guests')?.value ||'').trim();

  if (!roomId) { showMsg('nb-book-status','warning',t('msg-no-room-sel')); return; }
  if (!name)   { showMsg('nb-book-status','warning',t('msg-no-guest'));    return; }
  if (!nbSearchDates.check_in) { showMsg('nb-book-status','warning',t('msg-no-dates')); return; }

  const guests = [{ guest_name: name, email: email||null, phone: phone||null }];
  if (extra) {
    extra.split(/;|\n/).map(s=>s.trim()).filter(Boolean).forEach(line => {
      const [n,em,ph] = line.split(',').map(s=>s.trim());
      if (n) guests.push({ guest_name:n, email:em||null, phone:ph||null });
    });
  }

  setBusy('nb-book-btn',true);
  showMsg('nb-book-status','loading',t('msg-booking'));
  document.getElementById('nb-booking-result')?.classList.add('hidden');

  try {
    const { ok, status, data } = await callFn('create_booking', {
      room_id: roomId, check_in: nbSearchDates.check_in, check_out: nbSearchDates.check_out,
      source_channel: 'direct',
      guest_name: name, email: email||null, phone: phone||null,
      guest: guests[0], guests,
    });
    if (status===409) { showMsg('nb-book-status','error',t('msg-conflict')); return; }
    if (!ok) { showMsg('nb-book-status','error',data.error||'Error'); return; }
    showMsg('nb-book-status','success',t('msg-book-success'));
    const panel = document.getElementById('nb-booking-result');
    if (panel) {
      panel.innerHTML=`<div class="bp-label">${t('bp-label')}</div><div class="bp-code">${data.booking_id}</div>
        <div class="bp-detail">${roomId} · ${name} · ${nbSearchDates.check_in} → ${nbSearchDates.check_out}</div>`;
      panel.classList.remove('hidden');
    }
    loadDashboardStats();
  } catch(err) { showMsg('nb-book-status','error',t('msg-connect-err',err.message)); }
  finally { setBusy('nb-book-btn',false); }
});

// ── TAB 3: QUICK AVAILABILITY ──────────────────────────────────
(function() {
  const today=new Date().toISOString().split('T')[0];
  const ci=document.getElementById('av-check-in'), co=document.getElementById('av-check-out');
  if(!ci||!co) return;
  ci.min=today; co.min=today;
  ci.addEventListener('change',()=>{co.min=ci.value;if(co.value&&co.value<=ci.value)co.value='';});
})();

document.getElementById('av-search-btn')?.addEventListener('click', async () => {
  const ci=document.getElementById('av-check-in')?.value;
  const co=document.getElementById('av-check-out')?.value;
  if (!ci||!co) { showMsg('av-status','warning',t('msg-no-dates')); return; }
  showMsg('av-status','loading',t('msg-loading'));
  document.getElementById('av-rooms-container').innerHTML='';
  try {
    const { ok, data } = await callFn('check_availability',{check_in:ci,check_out:co});
    if (!ok) { showMsg('av-status','error',data.error||'Error'); return; }
    const rooms = data.available_rooms||[];
    if (!rooms.length) { showMsg('av-status','warning',t('msg-no-avail-rooms')); return; }
    showMsg('av-status','success',t('msg-found-rooms',rooms.length));
    const container=document.getElementById('av-rooms-container');
    const list=document.createElement('div'); list.className='room-list';
    rooms.forEach(room=>{
      const row=document.createElement('div'); row.className='room-row';
      row.innerHTML=`
        <div class="room-info">
          <h4>${room.room_type} &mdash; <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
          <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} người</div>
        </div>
        <div class="room-rate">${rateStr(room.rate_low,room.rate_high)}</div>`;
      list.appendChild(row);
    });
    container.appendChild(list);
  } catch(err) { showMsg('av-status','error',t('msg-connect-err',err.message)); }
});

// ══════════════════════════════════════════════════════════════
//  TAB 4: RATE MANAGEMENT (4.2)
//  Fix A: Room types loaded from Supabase (not hard-coded)
//  Fix B: Rates from v_channel_rates / rate_rule (not static)
//  Fix C: changed_by → null (UUID required, PIN auth has no UUID)
//  Fix D: Refresh rates + history after update
// ══════════════════════════════════════════════════════════════

async function loadRoomTypes() {
  const sel = document.getElementById('rate-room-type');
  if (!sel) return;
  sel.innerHTML = `<option value="">${t('loading-types')}</option>`;
  try {
    let types = [];

    // Attempt 1: dedicated room_types table
    try {
      const rows = await restGet('room_types', '?select=room_type&order=room_type');
      if (rows?.length) types = rows.map(r => r.room_type);
    } catch {}

    // Attempt 2: distinct room_type from room table
    if (!types.length) {
      const rows = await restGet('room', '?select=room_type');
      types = [...new Set((rows||[]).map(r=>r.room_type))].filter(Boolean).sort();
    }

    sel.innerHTML = `<option value="">${currentLang==='en'?'Select room type…':'Chọn loại phòng…'}</option>`;
    types.forEach(rt => {
      const opt = document.createElement('option');
      opt.value = rt; opt.textContent = rt;
      sel.appendChild(opt);
    });
  } catch (err) {
    sel.innerHTML = `<option value="">Lỗi: ${err.message}</option>`;
  }
}

function resetRateCards() {
  ['price-direct','price-ota1','price-ota2','price-gds'].forEach(id => {
    const el = document.getElementById(id); if(el) el.textContent = '—';
  });
}

async function loadCurrentRates(roomType) {
  resetRateCards();
  if (!roomType) return;
  try {
    let baseRate = null;
    // channel → element ID map (matching DB channel names)
    const channelMap = { direct:'price-direct', ota_1:'price-ota1', ota_2:'price-ota2', gds:'price-gds' };

    // Attempt 1: v_channel_rates view
    try {
      const rows = await restGet('v_channel_rates',
        `?room_type=eq.${encodeURIComponent(roomType)}`);
      if (rows?.length) {
        rows.forEach(r => {
          const elId = channelMap[r.channel];
          const price = r.computed_rate ?? r.rate ?? null;
          if (elId && price) document.getElementById(elId).textContent = vndFmt(price);
          if (!baseRate && r.base_rate) baseRate = Number(r.base_rate);
        });
        if (baseRate) {
          const inp = document.getElementById('rate-base-input');
          if (inp) inp.value = baseRate;
        }
        return; // done
      }
    } catch {}

    // Attempt 2: compute from rate_rule × room.rate_low
    const [rules, rooms] = await Promise.all([
      restGet('rate_rule', `?room_type=eq.${encodeURIComponent(roomType)}&select=channel,multiplier`),
      restGet('room', `?room_type=eq.${encodeURIComponent(roomType)}&select=rate_low&limit=1`),
    ]);
    baseRate = Number(rooms?.[0]?.rate_low) || null;
    if (baseRate) {
      const inp = document.getElementById('rate-base-input');
      if (inp) inp.value = baseRate;
      (rules||[]).forEach(r => {
        const elId = channelMap[r.channel];
        if (elId) document.getElementById(elId).textContent =
          vndFmt(Math.round(baseRate * Number(r.multiplier)));
      });
    }
  } catch (err) {
    showMsg('rate-status','error',t('msg-connect-err',err.message));
  }
}

// Room type dropdown → load rates + history
document.getElementById('rate-room-type')?.addEventListener('change', async function() {
  const rt = this.value;
  currentRoomTypeRate = rt || null;
  hideMsg('rate-status');
  if (!rt) {
    resetRateCards();
    document.getElementById('rate-history-container').innerHTML =
      `<div class="no-results">${t('select-type-first')}</div>`;
    const inp = document.getElementById('rate-base-input'); if(inp) inp.value='';
    return;
  }
  await Promise.all([loadCurrentRates(rt), loadRateHistory(rt)]);
});

// Update Rate handler
document.getElementById('update-rate-btn')?.addEventListener('click', async () => {
  const roomType    = (document.getElementById('rate-room-type')?.value || '').trim();
  const newBaseRate = Number(document.getElementById('rate-base-input')?.value);

  if (!roomType)              { showMsg('rate-status','warning',t('msg-no-type')); return; }
  if (!newBaseRate||newBaseRate<100000) { showMsg('rate-status','warning',t('msg-no-rate')); return; }

  setBusy('update-rate-btn',true);
  showMsg('rate-status','loading',t('msg-updating-rate'));

  try {
    const { ok, data } = await callFn('update_base_rate', {
      room_type:     roomType,
      new_base_rate: newBaseRate,
      changed_by:    null,   // ← FIX C: changed_by must be UUID or null; send null
    });

    if (!ok) {
      showMsg('rate-status','error', data.error || t('msg-rate-error'));
      return;
    }

    showMsg('rate-status','success', t('msg-rate-success', roomType, newBaseRate));

    // FIX D: Refresh from DB after update
    await Promise.all([loadCurrentRates(roomType), loadRateHistory(roomType)]);

  } catch(err) { showMsg('rate-status','error',t('msg-connect-err',err.message)); }
  finally { setBusy('update-rate-btn',false); }
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
    const wrap = document.createElement('div'); wrap.className='bookings-table-wrap';
    wrap.innerHTML = `
      <table class="bookings-table">
        <thead><tr>
          <th>Room Type</th><th>Old Rate</th><th>New Rate</th><th>Changed At</th>
        </tr></thead>
        <tbody id="history-tbody"></tbody>
      </table>`;
    container.innerHTML=''; container.appendChild(wrap);
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
  } catch(err) {
    container.innerHTML=`<div class="no-results">${t('msg-connect-err',err.message)}</div>`;
  }
}

document.getElementById('refresh-history-btn')?.addEventListener('click', () => {
  if (currentRoomTypeRate) loadRateHistory(currentRoomTypeRate);
});

// ── INIT ───────────────────────────────────────────────────────
initPin();
initLang();
initTabs();
