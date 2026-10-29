/* ============================================================
   LỤA VÀNG RESORT & SPA — DIRECT BOOKING FRONTEND
   app.js  |  Channel: direct
   ============================================================ */

const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;
const SOURCE_CHANNEL = "direct";

// ── I18N ─────────────────────────────────────────────────────
const I18N = {
  vi: {
    'hotel-sub':       'Resort &amp; Spa &ensp;·&ensp; Cổng Đặt Phòng Trực Tiếp',
    'step1-tag':       'Bước 1', 'step1-h2': 'Tìm phòng trống',
    'label-checkin':   'Ngày nhận phòng', 'label-checkout': 'Ngày trả phòng',
    'btn-search':      'Kiểm tra phòng trống',
    'step2-tag':       'Bước 2', 'step2-h2': 'Xác nhận thông tin đặt phòng',
    'label-room':      'Phòng đã chọn',
    'ph-room':         'Chọn phòng từ danh sách bên trên',
    'label-guest':     'Họ và tên khách lưu trú', 'ph-guest': 'Nguyễn Văn A',
    'label-email':     'Địa chỉ Email',       'ph-email':  'guest@domain.com',
    'label-email-note':'(để nhận phiếu xác nhận)',
    'label-phone':     'Số điện thoại liên hệ',     'ph-phone':  '0901 234 567',
    'btn-book':        'Xác nhận đặt phòng',
    'cancel-tag':      'Quản lý đặt phòng',    'cancel-h2': 'Tra cứu và hủy mã đặt phòng',
    'label-bid':       'Mã đặt phòng (Booking ID)',
    'ph-bid':          'Nhập mã đặt phòng vào đây…',
    'btn-cancel':      'Hủy đặt phòng',
    'footer-text':     'Lụa Vàng Resort & Spa · Cổng đặt phòng trực tuyến chính thức · 2026',
    'btn-pick':        'Chọn phòng', 'unit-guests': 'khách', 'unit-night': 'đêm',
    'contact':         'Liên hệ', 'room-fallback': 'Phòng',
    'bp-label':        'Mã đặt phòng — quý khách vui lòng lưu lại khi nhận phòng hoặc hủy phòng',
    'btn-copy':        'Sao chép mã', 'btn-copied': 'Đã sao chép ✓',
    'copy-prompt':     'Sao chép mã booking:',
    'msg-processing':  'Đang xử lý…',
    'msg-no-dates':    'Vui lòng chọn cả ngày nhận và trả phòng.',
    'msg-date-order':  'Ngày nhận phòng phải trước ngày trả phòng.',
    'msg-searching':   'Đang kiểm tra phòng trống…',
    'msg-backend-err': 'Không thể kết nối máy chủ. Thử lại sau.',
    'msg-no-rooms':    'Không có phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.',
    'msg-no-room-sel': 'Chưa chọn phòng. Tìm phòng ở bước 1 và nhấn «Chọn phòng».',
    'msg-no-guest':    'Vui lòng nhập tên khách lưu trú.',
    'msg-no-contact':  'Vui lòng nhập email hoặc số điện thoại để liên hệ xác nhận.',
    'msg-no-dates2':   'Chưa có ngày lưu trú. Quay lại bước 1 để tìm phòng.',
    'msg-booking':     'Đang tạo đặt phòng…',
    'msg-conflict':    'Phòng này vừa có người đặt trùng ngày. Vui lòng chọn phòng khác.',
    'msg-booking-err': 'Không thể tạo booking. Thử lại sau.',
    'msg-book-success':'Đặt phòng thành công! Quý khách vui lòng lưu lại mã bên dưới.',
    'msg-no-bid':      'Vui lòng nhập mã đặt phòng cần hủy.',
    'msg-cancelling':  'Đang xử lý hủy đặt phòng…',
    'msg-404':         'Không tìm thấy booking này. Kiểm tra lại mã đặt phòng.',
    'msg-400':         'Booking này không ở trạng thái có thể hủy (đã hủy trước đó?).',
    'msg-cancel-err':  'Không thể hủy booking lúc này. Thử lại sau.',
    'msg-found-rooms': (n) => `Tìm thấy <strong>${n}</strong> phòng trống sẵn sàng phục vụ.`,
    'msg-connect-err': (e) => `Lỗi kết nối: ${e}`,
    'msg-cancel-ok':   (id) => `Đã hủy thành công booking <strong>${id}</strong>.`,
    'confirm-cancel':  (id) => `Xác nhận hủy đặt phòng:\n\n${id}\n\nHành động này không thể hoàn tác.`,
  },
  en: {
    'hotel-sub':       'Resort &amp; Spa &ensp;·&ensp; Official Direct Booking Portal',
    'step1-tag':       'Step 1', 'step1-h2': 'Find Available Rooms',
    'label-checkin':   'Check-in Date', 'label-checkout': 'Check-out Date',
    'btn-search':      'Check Availability',
    'step2-tag':       'Step 2', 'step2-h2': 'Confirm Booking Details',
    'label-room':      'Selected Room',
    'ph-room':         'Select a room from the list above',
    'label-guest':     'Guest Full Name', 'ph-guest': 'John Doe',
    'label-email':     'Email Address',    'ph-email':  'guest@domain.com',
    'label-email-note':'(to receive confirmation)',
    'label-phone':     'Phone Number',   'ph-phone':  '+84 xxx xxx xxx',
    'btn-book':        'Confirm Booking',
    'cancel-tag':      'Manage Reservation', 'cancel-h2': 'Lookup & Cancel Reservation',
    'label-bid':       'Booking ID',
    'ph-bid':          'Enter your booking ID here…',
    'btn-cancel':      'Cancel Booking',
    'footer-text':     'Lua Vang Resort & Spa · Official Direct Booking Portal · 2026',
    'btn-pick':        'Select', 'unit-guests': 'guests', 'unit-night': 'night',
    'contact':         'Contact us', 'room-fallback': 'Room',
    'bp-label':        'Booking Confirmation — Please keep this ID for check-in and changes',
    'btn-copy':        'Copy ID', 'btn-copied': 'Copied ✓',
    'copy-prompt':     'Copy your booking ID:',
    'msg-processing':  'Processing…',
    'msg-no-dates':    'Please select both check-in and check-out dates.',
    'msg-date-order':  'Check-in date must be before check-out date.',
    'msg-searching':   'Checking availability…',
    'msg-backend-err': 'Unable to connect to the server. Please try again.',
    'msg-no-rooms':    'No rooms available for this period. Please try different dates.',
    'msg-no-room-sel': 'No room selected. Find a room in Step 1 and click "Select".',
    'msg-no-guest':    'Please enter the guest name.',
    'msg-no-contact':  'Please enter an email or phone number for confirmation.',
    'msg-no-dates2':   'No stay dates found. Please go back to Step 1.',
    'msg-booking':     'Creating your booking…',
    'msg-conflict':    'This room was just booked for the same dates. Please choose another.',
    'msg-booking-err': 'Unable to create booking. Please try again.',
    'msg-book-success':'Booking confirmed! Please save the ID below.',
    'msg-no-bid':      'Please enter the booking ID to cancel.',
    'msg-cancelling':  'Processing cancellation…',
    'msg-404':         'Booking not found. Please check the booking ID.',
    'msg-400':         'This booking cannot be cancelled (already cancelled?).',
    'msg-cancel-err':  'Unable to cancel booking. Please try again.',
    'msg-found-rooms': (n) => `Found <strong>${n}</strong> available room${n!==1?'s':''}.`,
    'msg-connect-err': (e) => `Connection error: ${e}`,
    'msg-cancel-ok':   (id) => `Booking <strong>${id}</strong> successfully cancelled.`,
    'confirm-cancel':  (id) => `Confirm booking cancellation:\n\n${id}\n\nThis action cannot be undone.`,
  },
};

// ── STATE ─────────────────────────────────────────────────────
let searchDates  = { check_in: null, check_out: null };
let selectedRoom = null;
let currentLang  = 'vi';

// ── TRANSLATE ─────────────────────────────────────────────────
function t(key, ...args) {
  const tbl = I18N[currentLang] || I18N.vi;
  const e   = (key in tbl) ? tbl[key] : (key in I18N.vi ? I18N.vi[key] : key);
  return typeof e === 'function' ? e(...args) : e;
}

// ── APPLY LANGUAGE ────────────────────────────────────────────
function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.title = lang === 'en'
    ? 'Direct Booking — Lua Vang Resort & Spa'
    : 'Đặt Phòng Trực Tuyến — Lụa Vàng Resort & Spa';

  document.querySelectorAll('.lang-opt').forEach(o =>
    o.classList.toggle('active', o.dataset.lang === lang));
  document.querySelectorAll('[data-i18n]').forEach(el =>
    { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el =>
    { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el =>
    { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('.btn-select').forEach(btn =>
    { btn.textContent = t('btn-pick'); });

  const bpLabel = document.querySelector('.bp-label');
  if (bpLabel) bpLabel.textContent = t('bp-label');
  const copyBtn = document.getElementById('copy-bid-btn');
  if (copyBtn) {
    const isCopied = Object.values(I18N).some(tb => copyBtn.textContent === tb['btn-copied']);
    if (!isCopied) copyBtn.textContent = t('btn-copy');
  }
  try { localStorage.setItem('booking-lang', lang); } catch {}
}

// ── API ───────────────────────────────────────────────────────
async function callFn(name, body) {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey':        ANON_KEY,
    },
    body: JSON.stringify(body),
  });
  let data = {};
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

// ── UI HELPERS ────────────────────────────────────────────────
function showMsg(id, type, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `msg ${type}`; el.innerHTML = html;
}
function hideMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'msg hidden'; el.innerHTML = '';
}
function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = busy;
  if (busy) { btn.dataset.orig = btn.textContent; btn.textContent = t('msg-processing'); }
  else { btn.textContent = btn.dataset.orig || btn.textContent; }
}

// ── FORMATTING ────────────────────────────────────────────────
function vnd(n) { return Number(n).toLocaleString('vi-VN') + ' ₫'; }
function rateStr(low, high) {
  const perNight = `/${t('unit-night')}`;
  if (low && high && String(low) !== String(high)) return `${vnd(low)} – ${vnd(high)}${perNight}`;
  if (low) return `${vnd(low)}${perNight}`;
  return t('contact');
}

// ── DATE INIT ─────────────────────────────────────────────────
(function() {
  const today = new Date().toISOString().split('T')[0];
  const ci = document.getElementById('check-in');
  const co = document.getElementById('check-out');
  if (!ci || !co) return;
  ci.min = today; co.min = today;
  ci.addEventListener('change', () => {
    co.min = ci.value;
    if (co.value && co.value <= ci.value) co.value = '';
  });
})();

// ── LANG TOGGLE INIT ──────────────────────────────────────────
(function() {
  document.getElementById('lang-toggle')?.addEventListener('click', e => {
    const opt = e.target.closest('.lang-opt');
    if (opt && opt.dataset.lang !== currentLang) applyLanguage(opt.dataset.lang);
  });
  let init = 'vi';
  try { const s = localStorage.getItem('booking-lang'); if (s==='en'||s==='vi') init=s; } catch {}
  applyLanguage(init);
})();

// ── SEARCH ────────────────────────────────────────────────────
document.getElementById('search-btn')?.addEventListener('click', async () => {
  const checkIn  = document.getElementById('check-in').value;
  const checkOut = document.getElementById('check-out').value;

  if (!checkIn || !checkOut) { showMsg('search-status','warning',t('msg-no-dates')); return; }
  if (checkIn >= checkOut)   { showMsg('search-status','error',t('msg-date-order'));  return; }

  searchDates  = { check_in: checkIn, check_out: checkOut };
  selectedRoom = null;
  const ri = document.getElementById('selected-room');
  ri.value = ''; ri.classList.remove('has-value');
  document.getElementById('rooms-container').innerHTML = '';

  setBusy('search-btn', true);
  showMsg('search-status', 'loading', t('msg-searching'));

  try {
    const { ok, data } = await callFn('check_availability', { 
      check_in: checkIn, 
      check_out: checkOut,
      source_channel: SOURCE_CHANNEL 
    });
    if (!ok) { showMsg('search-status','error',data.error||t('msg-backend-err')); return; }
    const rooms = data.available_rooms || [];
    if (!rooms.length) { showMsg('search-status','warning',t('msg-no-rooms')); return; }
    showMsg('search-status','success',t('msg-found-rooms',rooms.length));
    renderRooms(rooms);
  } catch (err) { showMsg('search-status','error',t('msg-connect-err',err.message)); }
  finally { setBusy('search-btn', false); }
});

function renderRooms(rooms) {
  const container = document.getElementById('rooms-container');
  container.innerHTML = '';
  const list = document.createElement('div'); list.className='room-list';
  rooms.forEach(room => {
    const row = document.createElement('div'); row.className='room-row'; row.dataset.id=room.room_id;
    row.innerHTML = `
      <div class="room-info">
        <h4>${room.room_type} &mdash;
          <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
        <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} ${t('unit-guests')}</div>
      </div>
      <div class="room-rate">${rateStr(room.rate_low,room.rate_high)}</div>
      <button class="btn-select" data-id="${room.room_id}">${t('btn-pick')}</button>`;
    list.appendChild(row);
  });
  container.appendChild(list);
  list.addEventListener('click', e => {
    const btn = e.target.closest('.btn-select'); if(!btn) return;
    const room = rooms.find(r=>r.room_id===btn.dataset.id); if(room) pickRoom(room,list);
  });
}

function pickRoom(room, listEl) {
  selectedRoom = room;
  listEl.querySelectorAll('.room-row').forEach(r=>
    r.classList.toggle('selected-row',r.dataset.id===room.room_id));
  const inp = document.getElementById('selected-room');
  inp.value = room.room_id; inp.classList.add('has-value');
  document.getElementById('book-section').scrollIntoView({behavior:'smooth',block:'start'});
}

// ── BOOK ──────────────────────────────────────────────────────
document.getElementById('book-btn')?.addEventListener('click', async () => {
  const roomId    = (document.getElementById('selected-room').value||'').trim();
  const guestName = (document.getElementById('guest-name').value   ||'').trim();
  const guestEmail = (document.getElementById('guest-email')?.value||'').trim();
  const guestPhone = (document.getElementById('guest-phone')?.value||'').trim();

  if (!roomId)    { showMsg('book-status','warning',t('msg-no-room-sel')); return; }
  if (!guestName) { showMsg('book-status','warning',t('msg-no-guest'));    return; }
  if (!guestEmail && !guestPhone) {
    showMsg('book-status','warning',t('msg-no-contact')); return;
  }
  if (!searchDates.check_in) { showMsg('book-status','warning',t('msg-no-dates2')); return; }

  setBusy('book-btn', true);
  showMsg('book-status','loading',t('msg-booking'));
  document.getElementById('booking-result').classList.add('hidden');

  try {
    const { ok, status, data } = await callFn('create_booking', {
      room_id:        roomId,
      check_in:       searchDates.check_in,
      check_out:      searchDates.check_out,
      source_channel: SOURCE_CHANNEL,
      channel:        SOURCE_CHANNEL,
      guest_name:     guestName,
      email:          guestEmail || null,
      phone:          guestPhone || null,
      guest: {
        guest_name: guestName,
        email:      guestEmail || null,
        phone:      guestPhone || null,
      },
      guests: [{
        guest_name: guestName,
        email:      guestEmail || null,
        phone:      guestPhone || null,
      }],
    });

    if (status === 409) { showMsg('book-status','error',t('msg-conflict'));      return; }
    if (!ok)            { showMsg('book-status','error',data.error||t('msg-booking-err')); return; }

    showMsg('book-status','success',t('msg-book-success'));
    renderBookingPanel(data.booking_id, roomId, guestName, searchDates.check_in, searchDates.check_out);
    document.getElementById('booking-id-input').value = data.booking_id;
  } catch (err) { showMsg('book-status','error',t('msg-connect-err',err.message)); }
  finally { setBusy('book-btn', false); }
});

function renderBookingPanel(bookingId, roomId, guestName, checkIn, checkOut) {
  const panel = document.getElementById('booking-result');
  const copyId = 'copy-bid-btn';
  panel.innerHTML = `
    <div class="bp-label">${t('bp-label')}</div>
    <div class="bp-code">${bookingId}</div>
    <div class="bp-detail">${roomId} &nbsp;·&nbsp; ${guestName} &nbsp;·&nbsp; ${checkIn} → ${checkOut} &nbsp;·&nbsp; <strong>Direct Website</strong></div>
    <button class="btn-copy" id="${copyId}">${t('btn-copy')}</button>`;
  panel.classList.remove('hidden');
  document.getElementById(copyId).addEventListener('click', () => {
    navigator.clipboard.writeText(bookingId)
      .then(() => {
        const btn = document.getElementById(copyId);
        btn.textContent = t('btn-copied');
        setTimeout(() => { btn.textContent = t('btn-copy'); }, 2200);
      })
      .catch(() => { prompt(t('copy-prompt'), bookingId); });
  });
}

// ── CANCEL (GỬI CHUẨN SOURCE_CHANNEL: "direct") ───────────────
document.getElementById('cancel-btn')?.addEventListener('click', async () => {
  const bookingId = (document.getElementById('booking-id-input').value||'').trim();
  if (!bookingId) { showMsg('cancel-status','warning',t('msg-no-bid')); return; }
  if (!window.confirm(t('confirm-cancel', bookingId))) return;

  setBusy('cancel-btn', true);
  showMsg('cancel-status','loading',t('msg-cancelling'));

  try {
    const { ok, status, data } = await callFn('cancel_booking', { 
      booking_id: bookingId,
      source_channel: SOURCE_CHANNEL,
      channel: SOURCE_CHANNEL
    });

    if (status === 403) { showMsg('cancel-status','error', data.error || 'Đơn đặt phòng này thuộc kênh khác!'); return; }
    if (status === 404) { showMsg('cancel-status','error', t('msg-404')); return; }
    if (status === 400 || status === 409) { showMsg('cancel-status','warning', data.error || t('msg-400')); return; }
    if (!ok) { showMsg('cancel-status','error', data.error || t('msg-cancel-err')); return; }

    showMsg('cancel-status','success',t('msg-cancel-ok',bookingId));
    document.getElementById('booking-id-input').value = '';
  } catch (err) { showMsg('cancel-status','error',t('msg-connect-err',err.message)); }
  finally { setBusy('cancel-btn', false); }
});
