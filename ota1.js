/* ============================================================
   VIETSTAY — OTA PORTAL
   Channel: ota_1  |  Bilingual VI/EN
   ============================================================ */

const SUPABASE_URL   = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY       = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE        = `${SUPABASE_URL}/functions/v1`;
const REST_BASE      = `${SUPABASE_URL}/rest/v1`;
const SOURCE_CHANNEL = "ota_1";
const CHANNEL_MULTIPLIER = 1.05;

let channelRatesCache = {};

// ── I18N ─────────────────────────────────────────────────────
const I18N = {
  vi: {
    'hotel-sub':       'Kênh đặt phòng khách sạn trực tuyến',
    'inv-title':       'Lụa Vàng Resort &amp; Spa',
    'inv-tag':         'Tình trạng phòng thực tế',
    'inv-sub':         'phòng còn',
    'inv-footer':      'Dữ liệu tình trạng phòng cập nhật trực tiếp theo thời gian thực',
    'step1-tag':       'Bước 1',     'step1-h2':  'Tìm phòng trống',
    'label-checkin':   'Ngày nhận phòng', 'label-checkout':'Ngày trả phòng',
    'btn-search':      'Kiểm tra phòng trống',
    'step2-tag':       'Bước 2',     'step2-h2':  'Xác nhận đặt phòng',
    'label-room':      'Phòng đã chọn', 'ph-room': 'Chọn phòng từ danh sách bên trên',
    'label-guest':     'Họ và tên khách lưu trú', 'ph-guest': 'Nguyễn Văn A',
    'label-email':     'Địa chỉ Email', 'ph-email': 'email@domain.com',
    'label-email-note':'(để nhận mã xác nhận)',
    'label-phone':     'Số điện thoại liên hệ', 'ph-phone': '0901 234 567',
    'btn-book':        'Xác nhận đặt phòng',
    'cancel-tag':      'Hủy đặt phòng', 'cancel-h2': 'Tra cứu và hủy mã đặt phòng',
    'label-bid':       'Mã đặt phòng (Booking ID)', 'ph-bid': 'Dán mã đặt phòng cần hủy vào đây…',
    'btn-cancel':      'Hủy đặt phòng',
    'footer-text':     'VietStay · Kênh phân phối trực tuyến chính thức · 2026',
    'btn-pick':        'Chọn phòng', 'contact': 'Liên hệ', 'unit-night': 'đêm', 'unit-guests': 'khách',
    'bp-label':        'Mã đặt phòng — quý khách vui lòng lưu lại khi nhận phòng hoặc hủy phòng',
    'btn-copy':        'Sao chép mã', 'btn-copied': 'Đã sao chép ✓', 'copy-prompt': 'Sao chép mã đặt phòng:',
    'msg-processing':  'Đang xử lý…',
    'msg-no-dates':    'Vui lòng chọn cả ngày nhận và trả phòng.',
    'msg-date-order':  'Ngày nhận phòng phải trước ngày trả phòng.',
    'msg-searching':   'Đang kiểm tra tình trạng phòng trống…',
    'msg-no-rooms':    'Rất tiếc, đã hết phòng trống trong khoảng thời gian đã chọn.',
    'msg-no-room-sel': 'Chưa chọn phòng. Vui lòng bấm «Chọn phòng» ở Bước 1.',
    'msg-no-guest':    'Vui lòng nhập họ và tên khách lưu trú.',
    'msg-no-contact':  'Vui lòng cung cấp ít nhất email hoặc số điện thoại để liên hệ xác nhận.',
    'msg-no-dates2':   'Chưa chọn ngày lưu trú. Vui lòng quay lại Bước 1.',
    'msg-booking':     'Đang tiến hành đặt phòng…',
    'msg-conflict':    'Phòng này vừa có khách đặt cùng thời gian. Vui lòng chọn phòng khác.',
    'msg-book-err':    'Không thể hoàn tất đặt phòng lúc này. Quý khách vui lòng thử lại sau.',
    'msg-book-ok':     'Đặt phòng thành công! Quý khách vui lòng lưu lại mã đặt phòng bên dưới.',
    'msg-no-bid':      'Vui lòng nhập mã đặt phòng cần hủy.',
    'msg-cancelling':  'Đang xử lý yêu cầu hủy…',
    'msg-404':         'Không tìm thấy mã đặt phòng. Vui lòng kiểm tra lại.',
    'msg-400':         'Mã đặt phòng này không thể hủy hoặc đã được hủy trước đó.',
    'msg-cancel-err':  'Không thể hủy lúc này. Vui lòng liên hệ bộ phận hỗ trợ.',
    'inv-not-synced':  'Đang kết nối lại…',
    'msg-found-rooms': (n) => `Tìm thấy <strong>${n}</strong> phòng sẵn sàng phục vụ.`,
    'msg-connect-err': (e) => `Lỗi kết nối máy chủ: ${e}`,
    'msg-cancel-ok':   (id) => `Đã hủy thành công đơn đặt phòng <strong>${id}</strong>.`,
    'confirm-cancel':  (id) => `Quý khách có chắc chắn muốn hủy đơn đặt phòng sau:\n\n${id}\n\nThao tác này không thể hoàn tác.`,
  },
  en: {
    'hotel-sub':       'Online Booking Channel',
    'inv-title':       'Lụa Vàng Resort &amp; Spa',
    'inv-tag':         'Live Availability',
    'inv-sub':         'rooms left',
    'inv-footer':      'Room inventory synchronized directly in real-time',
    'step1-tag':       'Step 1',  'step1-h2':  'Find Available Rooms',
    'label-checkin':   'Check-in Date', 'label-checkout':'Check-out Date',
    'btn-search':      'Check Availability',
    'step2-tag':       'Step 2',  'step2-h2':  'Confirm Booking',
    'label-room':      'Selected Room', 'ph-room': 'Choose a room from the list above',
    'label-guest':     'Guest Full Name', 'ph-guest': 'John Doe',
    'label-email':     'Email Address', 'ph-email': 'email@domain.com',
    'label-email-note':'(to receive confirmation)',
    'label-phone':     'Phone Number', 'ph-phone': '+84 xxx xxx xxx',
    'btn-book':        'Confirm Booking',
    'cancel-tag':      'Cancel Booking', 'cancel-h2': 'Manage & Cancel Reservation',
    'label-bid':       'Booking ID', 'ph-bid': 'Paste your Booking ID here…',
    'btn-cancel':      'Cancel Reservation',
    'footer-text':     'VietStay · Official Distribution Channel · 2026',
    'btn-pick':        'Select', 'contact': 'Contact us', 'unit-night': 'night', 'unit-guests': 'guests',
    'bp-label':        'Booking Confirmation — Please keep this ID for check-in and changes',
    'btn-copy':        'Copy ID', 'btn-copied': 'Copied ✓', 'copy-prompt': 'Copy booking ID:',
    'msg-processing':  'Processing…',
    'msg-no-dates':    'Please select both check-in and check-out dates.',
    'msg-date-order':  'Check-in date must be before check-out date.',
    'msg-searching':   'Checking room availability…',
    'msg-no-rooms':    'Sorry, no rooms are available for the selected dates.',
    'msg-no-room-sel': 'Please select a room from Step 1.',
    'msg-no-guest':    'Please enter the guest name.',
    'msg-no-contact':  'Please enter either an email or phone number for confirmation.',
    'msg-no-dates2':   'No stay dates found. Please return to Step 1.',
    'msg-booking':     'Confirming your reservation…',
    'msg-conflict':    'This room has just been reserved. Please pick another room.',
    'msg-book-err':    'Unable to create reservation. Please try again later.',
    'msg-book-ok':     'Booking successful! Please save your Booking ID below.',
    'msg-no-bid':      'Please enter your Booking ID to cancel.',
    'msg-cancelling':  'Processing cancellation…',
    'msg-404':         'Booking ID not found. Please double-check.',
    'msg-400':         'This booking cannot be cancelled or is already cancelled.',
    'msg-cancel-err':  'Unable to cancel. Please contact guest support.',
    'inv-not-synced':  'Reconnecting…',
    'msg-found-rooms': (n) => `Found <strong>${n}</strong> available room${n!==1?'s':''}.`,
    'msg-connect-err': (e) => `Connection error: ${e}`,
    'msg-cancel-ok':   (id) => `Successfully cancelled booking <strong>${id}</strong>.`,
    'confirm-cancel':  (id) => `Are you sure you want to cancel booking:\n\n${id}\n\nThis action cannot be undone.`,
  },
};

let currentLang  = 'vi';
let searchDates  = { check_in: null, check_out: null };
let selectedRoom = null;

function t(key, ...args) {
  const tbl = I18N[currentLang] || I18N.vi;
  const e   = (key in tbl) ? tbl[key] : (key in I18N.vi ? I18N.vi[key] : key);
  return typeof e === 'function' ? e(...args) : e;
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.title = lang === 'en'
    ? 'VietStay — Online Hotel Booking'
    : 'VietStay — Đặt phòng khách sạn trực tuyến';
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
  try { localStorage.setItem('ota1-lang', lang); } catch {}
}

async function callFn(name, body) {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${ANON_KEY}`, 'apikey':ANON_KEY },
    body: JSON.stringify(body),
  });
  let data = {}; try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

async function restGet(path, params = '') {
  const res = await fetch(`${REST_BASE}/${path}${params}`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`REST ${res.status}`);
  return res.json();
}

async function fetchChannelRates() {
  try {
    const rows = await restGet('v_channel_rates', `?channel=eq.${SOURCE_CHANNEL}`);
    if (rows && rows.length > 0) {
      rows.forEach(r => {
        const key = String(r.room_type || '').toLowerCase().trim();
        const price = Number(r.computed_rate ?? r.rate ?? r.channel_rate ?? 0);
        if (price > 0) channelRatesCache[key] = price;
      });
    }
  } catch (e) {
    console.warn("Dùng hệ số x1.05 cho OTA 1:", e.message);
  }
}

function showMsg(id, type, html) { const el=document.getElementById(id); if (el) { el.className=`msg ${type}`; el.innerHTML=html; } }
function setBusy(btnId, busy) {
  const btn=document.getElementById(btnId); if (!btn) return;
  btn.disabled=busy;
  if(busy){btn.dataset.orig=btn.textContent;btn.textContent=t('msg-processing');}
  else{btn.textContent=btn.dataset.orig||btn.textContent;}
}
function vnd(n) { return Number(n).toLocaleString('vi-VN')+' ₫'; }

function getDisplayRate(room) {
  const pn = `/${t('unit-night')}`;
  const key = String(room.room_type || '').toLowerCase().trim();

  if (channelRatesCache[key]) {
    return `${vnd(channelRatesCache[key])}${pn}`;
  }

  const base = Number(room.rate_low || room.base_rate || 0);
  if (base > 0) {
    const otaPrice = Math.round(base * CHANNEL_MULTIPLIER);
    return `${vnd(otaPrice)}${pn}`;
  }

  return t('contact');
}

(function(){
  const today=new Date().toISOString().split('T')[0];
  const ci=document.getElementById('check-in'), co=document.getElementById('check-out');
  if (!ci || !co) return;
  ci.min=today; co.min=today;
  ci.addEventListener('change',()=>{ co.min=ci.value; if(co.value&&co.value<=ci.value) co.value=''; });
})();

(function(){
  document.getElementById('lang-toggle')?.addEventListener('click', e=>{
    const opt=e.target.closest('.lang-opt');
    if(opt&&opt.dataset.lang!==currentLang) applyLanguage(opt.dataset.lang);
  });
  let saved='vi'; try{const s=localStorage.getItem('ota1-lang');if(s==='en'||s==='vi')saved=s;}catch{}
  applyLanguage(saved);
})();

async function loadInventory() {
  try {
    const rows = await restGet('channel_inventory',
      `?channel=eq.${SOURCE_CHANNEL}&select=room_type,available_count,updated_at&order=updated_at.desc`);
    if (!rows?.length) return;
    
    const seen = new Set();
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = '';
    
    rows.forEach(row => {
      const key = (row.room_type || '').toLowerCase().trim();
      if (seen.has(key)) return;
      seen.add(key);

      const count = Number(row.available_count);
      const cls = count === 0 ? 'sold' : count <= 2 ? 'low' : '';
      const card = document.createElement('div');
      card.className = `inv-card ${cls}`;
      card.innerHTML = `
        <div class="inv-type">${row.room_type}</div>
        <div class="inv-count">${count}</div>
        <div class="inv-sub">${t('inv-sub')}</div>`;
      grid.appendChild(card);
    });

    if (rows[0]?.updated_at) {
      const d = new Date(rows[0].updated_at);
      document.getElementById('inv-updated').textContent =
        `${d.toLocaleTimeString('vi-VN')} · ${d.toLocaleDateString('vi-VN')}`;
    }
  } catch {
    document.getElementById('inv-updated').textContent = t('inv-not-synced');
  }
}

document.getElementById('search-btn')?.addEventListener('click', async ()=>{
  const ci=document.getElementById('check-in').value;
  const co=document.getElementById('check-out').value;
  if(!ci||!co){showMsg('search-status','warning',t('msg-no-dates'));return;}
  if(ci>=co){showMsg('search-status','error',t('msg-date-order'));return;}
  searchDates={check_in:ci,check_out:co}; selectedRoom=null;
  const ri=document.getElementById('selected-room'); ri.value=''; ri.classList.remove('has-value');
  document.getElementById('rooms-container').innerHTML='';
  setBusy('search-btn',true); showMsg('search-status','loading',t('msg-searching'));
  try{
    await fetchChannelRates();
    const{ok,data}=await callFn('check_availability',{check_in:ci,check_out:co,source_channel:SOURCE_CHANNEL});
    if(!ok){showMsg('search-status','error',data.error||t('msg-no-rooms'));return;}
    const rooms=data.available_rooms||[];
    if(!rooms.length){showMsg('search-status','warning',t('msg-no-rooms'));return;}
    showMsg('search-status','success',t('msg-found-rooms',rooms.length));
    renderRooms(rooms);
  }catch(err){showMsg('search-status','error',t('msg-connect-err',err.message));}
  finally{setBusy('search-btn',false);}
});

function renderRooms(rooms){
  const container=document.getElementById('rooms-container'); container.innerHTML='';
  const list=document.createElement('div'); list.className='room-list';
  rooms.forEach(room=>{
    const row=document.createElement('div'); row.className='room-row'; row.dataset.id=room.room_id;
    row.innerHTML=`<div class="room-info">
      <h4>${room.room_type} &mdash; <span style="font-family:var(--sans);font-size:.85rem">${room.room_id}</span></h4>
      <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} ${t('unit-guests')}</div>
    </div>
    <div class="room-rate">${getDisplayRate(room)}</div>
    <button class="btn-select" data-id="${room.room_id}">${t('btn-pick')}</button>`;
    list.appendChild(row);
  });
  container.appendChild(list);
  list.addEventListener('click',e=>{
    const btn=e.target.closest('.btn-select');if(!btn)return;
    const room=rooms.find(r=>r.room_id===btn.dataset.id);if(room)pickRoom(room,list);
  });
}

function pickRoom(room,listEl){
  selectedRoom=room;
  listEl.querySelectorAll('.room-row').forEach(r=>r.classList.toggle('selected-row',r.dataset.id===room.room_id));
  const inp=document.getElementById('selected-room');inp.value=room.room_id;inp.classList.add('has-value');
  document.getElementById('book-section').scrollIntoView({behavior:'smooth',block:'start'});
}

document.getElementById('book-btn')?.addEventListener('click', async ()=>{
  const roomId     = (document.getElementById('selected-room').value || '').trim();
  const guestName  = (document.getElementById('guest-name').value    || '').trim();
  const guestEmail = (document.getElementById('guest-email')?.value  || '').trim();
  const guestPhone = (document.getElementById('guest-phone')?.value  || '').trim();

  if(!roomId)    { showMsg('book-status','warning',t('msg-no-room-sel')); return; }
  if(!guestName) { showMsg('book-status','warning',t('msg-no-guest'));    return; }
  if(!guestEmail && !guestPhone) {
    showMsg('book-status','warning',t('msg-no-contact')); return;
  }
  if(!searchDates.check_in){ showMsg('book-status','warning',t('msg-no-dates2')); return; }

  setBusy('book-btn',true);
  showMsg('book-status','loading',t('msg-booking'));
  document.getElementById('booking-result').classList.add('hidden');

  try{
    const {ok, status, data} = await callFn('create_booking', {
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

    if(status === 409) { showMsg('book-status','error',t('msg-conflict')); return; }
    if(!ok)            { showMsg('book-status','error',data.error || t('msg-book-err')); return; }

    showMsg('book-status','success',t('msg-book-ok'));
    renderBookingPanel(data.booking_id, roomId, guestName, searchDates.check_in, searchDates.check_out);
    document.getElementById('booking-id-input').value = data.booking_id;
    loadInventory();
  }catch(err){
    showMsg('book-status','error',t('msg-connect-err',err.message));
  }finally{
    setBusy('book-btn',false);
  }
});

function renderBookingPanel(bookingId,roomId,guestName,checkIn,checkOut){
  const panel=document.getElementById('booking-result');
  const copyId='copy-bid-btn';
  panel.innerHTML=`<div class="bp-label">${t('bp-label')}</div>
    <div class="bp-code">${bookingId}</div>
    <div class="bp-detail">${roomId} &nbsp;·&nbsp; ${guestName} &nbsp;·&nbsp; ${checkIn} → ${checkOut}
      &nbsp;·&nbsp; <strong style="color:var(--gold)">VietStay</strong></div>
    <button class="btn-copy" id="${copyId}">${t('btn-copy')}</button>`;
  panel.classList.remove('hidden');
  document.getElementById(copyId).addEventListener('click',()=>{
    navigator.clipboard.writeText(bookingId)
      .then(()=>{
        const b=document.getElementById(copyId);
        b.textContent=t('btn-copied');
        setTimeout(()=>{b.textContent=t('btn-copy');}, 2200);
      })
      .catch(()=>{prompt(t('copy-prompt'),bookingId);});
  });
}

// ── CANCEL (GỬI CHUẨN SOURCE_CHANNEL: "ota_1") ────────────────
document.getElementById('cancel-btn')?.addEventListener('click', async ()=>{
  const bookingId = (document.getElementById('booking-id-input').value || '').trim();
  if(!bookingId){ showMsg('cancel-status','warning',t('msg-no-bid')); return; }
  if(!window.confirm(t('confirm-cancel', bookingId))) return;
  
  setBusy('cancel-btn', true);
  showMsg('cancel-status', 'loading', t('msg-cancelling'));

  try {
    const {ok, status, data} = await callFn('cancel_booking', {
      booking_id: bookingId,
      source_channel: SOURCE_CHANNEL,
      channel: SOURCE_CHANNEL
    });

    if(status === 403) { showMsg('cancel-status','error', data.error || 'Đơn đặt phòng này thuộc kênh khác!'); return; }
    if(status === 404) { showMsg('cancel-status','error', t('msg-404')); return; }
    if(status === 400 || status === 409) { showMsg('cancel-status','warning', data.error || t('msg-400')); return; }
    if(!ok)            { showMsg('cancel-status','error', data.error || t('msg-cancel-err')); return; }

    showMsg('cancel-status','success',t('msg-cancel-ok', bookingId));
    document.getElementById('booking-id-input').value = '';
    loadInventory();
  } catch(err) {
    showMsg('cancel-status','error',t('msg-connect-err',err.message));
  } finally {
    setBusy('cancel-btn', false);
  }
});

fetchChannelRates();
loadInventory();
setInterval(loadInventory, 30000);
