/* ============================================================
   STAYASIA — OTA 2  |  ota2.js
   Channel: ota_2  |  Bilingual VI/EN  |  Multi-Guest
   ============================================================ */

const SUPABASE_URL   = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY       = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE        = `${SUPABASE_URL}/functions/v1`;
const REST_BASE      = `${SUPABASE_URL}/rest/v1`;
const SOURCE_CHANNEL = "ota_2";

// ── I18N ─────────────────────────────────────────────────────
const I18N = {
  vi: {
    'hotel-sub':      'Nền tảng đặt phòng nghỉ dưỡng Châu Á',
    'inv-title':      'Lụa Vàng Resort &amp; Spa',
    'inv-tag':        'Tình trạng phòng thực tế', 'inv-sub': 'phòng còn',
    'inv-footer':     'Tự động cập nhật từ hệ thống quản trị trung tâm mỗi 30 giây',
    'step1-tag':      'Bước 1', 'step1-h2': 'Tìm phòng trống',
    'label-checkin':  'Ngày nhận phòng', 'label-checkout': 'Ngày trả phòng',
    'btn-search':     'Kiểm tra phòng trống',
    'step2-tag':      'Bước 2', 'step2-h2': 'Xác nhận đặt phòng',
    'label-room':     'Phòng đã chọn', 'ph-room': 'Chọn phòng từ danh sách bên trên',
    'label-guest':    'Họ và tên khách đại diện', 'ph-guest': 'Nguyễn Văn A',
    'label-email':    'Địa chỉ Email', 'ph-email': 'guest@domain.com',
    'label-phone':    'Số điện thoại', 'ph-phone': '0901 234 567',
    'label-returning':'Thông tin liên hệ xác nhận',
    'label-multi':    'Danh sách khách đi cùng phòng (nếu có)',
    'label-extra':    'Nhập từng khách theo định dạng: Họ tên, Email (phân cách bởi dấu chấm phẩy)',
    'ph-extra':       'Trần Thị B, b@domain.com; Lê Văn C, c@domain.com',
    'btn-book':       'Xác nhận đặt phòng',
    'cancel-tag':     'Quản lý đặt phòng', 'cancel-h2': 'Tra cứu và hủy mã đặt phòng',
    'label-bid':      'Mã đặt phòng (Booking ID)', 'ph-bid': 'Dán mã đặt phòng cần hủy vào đây…',
    'btn-cancel':     'Hủy đặt phòng',
    'footer-text':    'StayAsia · Kênh phân phối phòng nghỉ dưỡng Châu Á · 2026',
    'btn-pick':       'Chọn phòng', 'contact': 'Liên hệ', 'unit-night': 'đêm', 'unit-guests': 'khách',
    'bp-label':       'Mã đặt phòng — quý khách lưu lại để tra cứu và hủy phòng',
    'btn-copy':       'Sao chép mã', 'btn-copied': 'Đã sao chép ✓', 'copy-prompt': 'Sao chép mã booking:',
    'msg-processing': 'Đang xử lý…',
    'msg-no-dates':   'Vui lòng chọn cả ngày nhận và trả phòng.',
    'msg-date-order': 'Ngày nhận phòng phải trước ngày trả phòng.',
    'msg-searching':  'Đang kiểm tra phòng trống…',
    'msg-no-rooms':   'Không có phòng trống trong khoảng thời gian này.',
    'msg-no-room-sel':'Chưa chọn phòng. Vui lòng bấm «Chọn phòng» ở Bước 1.',
    'msg-no-guest':   'Vui lòng nhập họ và tên khách đại diện.',
    'msg-no-dates2':  'Chưa chọn ngày lưu trú. Vui lòng quay lại Bước 1.',
    'msg-booking':    'Đang tiến hành đặt phòng…',
    'msg-conflict':   'Phòng này vừa có khách đặt cùng thời gian. Vui lòng chọn phòng khác.',
    'msg-book-err':   'Không thể tạo đặt phòng lúc này. Thử lại sau.',
    'msg-book-ok':    'Đặt phòng thành công! Lưu lại mã đặt phòng bên dưới.',
    'msg-no-bid':     'Vui lòng nhập mã đặt phòng cần hủy.',
    'msg-cancelling': 'Đang xử lý hủy đặt phòng…',
    'msg-404':        'Không tìm thấy mã đặt phòng này. Kiểm tra lại mã.',
    'msg-400':        'Đơn đặt phòng này không ở trạng thái có thể hủy.',
    'msg-wrong-channel':'Mã đặt phòng này thuộc kênh khác (không phải đặt qua StayAsia). Quý khách vui lòng truy cập đúng kênh đã đặt để hủy!',
    'msg-cancel-err': 'Không thể hủy lúc này. Thử lại sau.',
    'inv-not-synced': 'Đang kết nối lại…',
    'msg-found-rooms':(n)=>`Tìm thấy <strong>${n}</strong> phòng sẵn sàng phục vụ.`,
    'msg-connect-err':(e)=>`Lỗi kết nối máy chủ: ${e}`,
    'msg-cancel-ok':  (id)=>`Đã hủy thành công đơn đặt phòng <strong>${id}</strong>.`,
    'confirm-cancel': (id)=>`Xác nhận hủy đặt phòng:\n\n${id}\n\nHành động này không thể hoàn tác.`,
  },
  en: {
    'hotel-sub':      'Asia\'s Premier Booking Platform',
    'inv-title':      'Lụa Vàng Resort &amp; Spa',
    'inv-tag':        'Room Availability Status', 'inv-sub': 'rooms left',
    'inv-footer':     'Auto-synced from Central CRS every 30 seconds',
    'step1-tag':      'Step 1', 'step1-h2': 'Find Available Rooms',
    'label-checkin':  'Check-in Date', 'label-checkout': 'Check-out Date',
    'btn-search':     'Check Availability',
    'step2-tag':      'Step 2', 'step2-h2': 'Confirm Booking',
    'label-room':     'Selected Room', 'ph-room': 'Select a room from the results above',
    'label-guest':    'Primary Guest Name', 'ph-guest': 'John Doe',
    'label-email':    'Email Address', 'ph-email': 'guest@domain.com',
    'label-phone':    'Phone Number', 'ph-phone': '+84 xxx xxx xxx',
    'label-returning':'Contact Information',
    'label-multi':    'Accompanying Guests',
    'label-extra':    'Enter each guest separated by semicolon (Name, Email)',
    'ph-extra':       'Anna Nguyen, anna@email.com; Tom Tran, tom@email.com',
    'btn-book':       'Confirm Booking',
    'cancel-tag':     'Manage Reservation', 'cancel-h2': 'Cancel Reservation',
    'label-bid':      'Booking ID', 'ph-bid': 'Paste your booking ID here…',
    'btn-cancel':     'Cancel Reservation',
    'footer-text':    'StayAsia · Asian Distribution Channel · 2026',
    'btn-pick':       'Select', 'contact': 'Contact us', 'unit-night': 'night', 'unit-guests': 'guests',
    'bp-label':       'Booking Confirmation Code — Keep this code for your stay',
    'btn-copy':       'Copy ID', 'btn-copied': 'Copied ✓', 'copy-prompt': 'Copy your booking ID:',
    'msg-processing': 'Processing…',
    'msg-no-dates':   'Please select both check-in and check-out dates.',
    'msg-date-order': 'Check-in date must be before check-out date.',
    'msg-searching':  'Checking availability…',
    'msg-no-rooms':   'No rooms available for this period.',
    'msg-no-room-sel':'No room selected. Pick a room in Step 1.',
    'msg-no-guest':   'Please enter primary guest name.',
    'msg-no-dates2':  'No stay dates found. Return to Step 1.',
    'msg-booking':    'Confirming reservation…',
    'msg-conflict':   'Room already booked for these dates. Please choose another.',
    'msg-book-err':   'Unable to create booking. Please try again.',
    'msg-book-ok':    'Booking confirmed! Save your booking ID below.',
    'msg-no-bid':     'Please enter booking ID to cancel.',
    'msg-cancelling': 'Processing cancellation…',
    'msg-404':        'Booking ID not found.',
    'msg-400':        'This booking cannot be cancelled or is already cancelled.',
    'msg-wrong-channel':'This reservation was booked via another channel. Please cancel via the original booking channel!',
    'msg-cancel-err': 'Unable to cancel booking. Please try again.',
    'inv-not-synced': 'Reconnecting…',
    'msg-found-rooms':(n)=>`Found <strong>${n}</strong> available room${n!==1?'s':''}.`,
    'msg-connect-err':(e)=>`Connection error: ${e}`,
    'msg-cancel-ok':  (id)=>`Booking <strong>${id}</strong> successfully cancelled.`,
    'confirm-cancel': (id)=>`Confirm booking cancellation:\n\n${id}\n\nThis action cannot be undone.`,
  },
};

let currentLang  = 'vi';
let searchDates  = { check_in: null, check_out: null };
let selectedRoom = null;

function t(key,...args){
  const tbl=I18N[currentLang]||I18N.vi;
  const e=(key in tbl)?tbl[key]:(key in I18N.vi?I18N.vi[key]:key);
  return typeof e==='function'?e(...args):e;
}
function applyLanguage(lang){
  currentLang=lang; document.documentElement.lang=lang;
  document.title=lang==='en'?'StayAsia — Online Booking':'StayAsia — Đặt phòng trực tuyến';
  document.querySelectorAll('.lang-opt').forEach(o=>o.classList.toggle('active',o.dataset.lang===lang));
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml);});
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{el.placeholder=t(el.dataset.i18nPlaceholder);});
  document.querySelectorAll('.btn-select').forEach(btn=>{btn.textContent=t('btn-pick');});
  const bpLabel=document.querySelector('.bp-label'); if(bpLabel) bpLabel.textContent=t('bp-label');
  try{localStorage.setItem('ota2-lang',lang);}catch{}
}

async function callFn(name,body){
  const res=await fetch(`${FN_BASE}/${name}`,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${ANON_KEY}`,'apikey':ANON_KEY},
    body:JSON.stringify(body),
  });
  let data={};try{data=await res.json();}catch{}
  return{ok:res.ok,status:res.status,data};
}
async function restGet(path,params=''){
  const res=await fetch(`${REST_BASE}/${path}${params}`,{
    headers:{'apikey':ANON_KEY,'Authorization':`Bearer ${ANON_KEY}`},
  });
  if(!res.ok) throw new Error(`REST ${res.status}`);
  return res.json();
}

function showMsg(id,type,html){const el=document.getElementById(id);if(el){el.className=`msg ${type}`;el.innerHTML=html;}}
function setBusy(btnId,busy){
  const btn=document.getElementById(btnId);if(!btn)return;btn.disabled=busy;
  if(busy){btn.dataset.orig=btn.textContent;btn.textContent=t('msg-processing');}
  else{btn.textContent=btn.dataset.orig||btn.textContent;}
}
function vnd(n){return Number(n).toLocaleString('vi-VN')+' ₫';}
function rateStr(low,high){
  const pn=`/${t('unit-night')}`;
  if(low&&high&&String(low)!==String(high)) return`${vnd(low)} – ${vnd(high)}${pn}`;
  if(low) return`${vnd(low)}${pn}`;
  return t('contact');
}

function buildGuestPayload(){
  const name  =(document.getElementById('guest-name')?.value  ||'').trim();
  const email =(document.getElementById('guest-email')?.value ||'').trim();
  const phone =(document.getElementById('guest-phone')?.value ||'').trim();
  const extra =(document.getElementById('extra-guests')?.value||'').trim();
  const guests=[{guest_name:name,email:email||null,phone:phone||null}];
  if(extra){
    extra.split(/;|\n/).map(s=>s.trim()).filter(Boolean).forEach(line=>{
      const[n,em,ph]=line.split(',').map(s=>s.trim());
      if(n) guests.push({guest_name:n,email:em||null,phone:ph||null});
    });
  }
  return{guest_name:name,email:email||null,phone:phone||null,guest:guests[0],guests};
}

(function(){
  const today=new Date().toISOString().split('T')[0];
  const ci=document.getElementById('check-in'),co=document.getElementById('check-out');
  if(!ci||!co)return;ci.min=today;co.min=today;
  ci.addEventListener('change',()=>{co.min=ci.value;if(co.value&&co.value<=ci.value)co.value='';});
})();

(function(){
  document.getElementById('lang-toggle')?.addEventListener('click',e=>{
    const opt=e.target.closest('.lang-opt');
    if(opt&&opt.dataset.lang!==currentLang) applyLanguage(opt.dataset.lang);
  });
  let saved='vi';try{const s=localStorage.getItem('ota2-lang');if(s==='en'||s==='vi')saved=s;}catch{}
  applyLanguage(saved);
})();

async function loadInventory(){
  try{
    const rows=await restGet('channel_inventory',
      `?channel=eq.${SOURCE_CHANNEL}&select=room_type,available_count,updated_at&order=updated_at.desc`);
    if(!rows?.length) return;
    const seen=new Set();
    const grid=document.getElementById('inv-grid');grid.innerHTML='';
    rows.forEach(row=>{
      const key=(row.room_type||'').toLowerCase().trim();
      if(seen.has(key)) return; seen.add(key);
      const count=Number(row.available_count);
      const cls=count===0?'sold':count<=2?'low':'';
      const card=document.createElement('div');card.className=`inv-card ${cls}`;
      card.innerHTML=`<div class="inv-type">${row.room_type}</div>
        <div class="inv-count">${count}</div><div class="inv-sub">${t('inv-sub')}</div>`;
      grid.appendChild(card);
    });
    if(rows[0]?.updated_at){
      const d=new Date(rows[0].updated_at);
      document.getElementById('inv-updated').textContent=
        `${d.toLocaleTimeString('vi-VN')} · ${d.toLocaleDateString('vi-VN')}`;
    }
  }catch{document.getElementById('inv-updated').textContent=t('inv-not-synced');}
}

document.getElementById('search-btn')?.addEventListener('click',async()=>{
  const ci=document.getElementById('check-in').value;
  const co=document.getElementById('check-out').value;
  if(!ci||!co){showMsg('search-status','warning',t('msg-no-dates'));return;}
  if(ci>=co){showMsg('search-status','error',t('msg-date-order'));return;}
  searchDates={check_in:ci,check_out:co};selectedRoom=null;
  const ri=document.getElementById('selected-room');ri.value='';ri.classList.remove('has-value');
  document.getElementById('rooms-container').innerHTML='';
  setBusy('search-btn',true);showMsg('search-status','loading',t('msg-searching'));
  try{
    const{ok,data}=await callFn('check_availability',{check_in:ci,check_out:co,source_channel:SOURCE_CHANNEL});
    if(!ok){showMsg('search-status','error',data.error||t('msg-no-rooms'));return;}
    const rooms=data.available_rooms||[];
    if(!rooms.length){showMsg('search-status','warning',t('msg-no-rooms'));return;}
    showMsg('search-status','success',t('msg-found-rooms',rooms.length));
    const container=document.getElementById('rooms-container');container.innerHTML='';
    const list=document.createElement('div');list.className='room-list';
    rooms.forEach(room=>{
      const row=document.createElement('div');row.className='room-row';row.dataset.id=room.room_id;
      row.innerHTML=`<div class="room-info">
        <h4>${room.room_type} &mdash; <span style="font-family:var(--sans);font-size:.85rem">${room.room_id}</span></h4>
        <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} ${t('unit-guests')}</div>
      </div><div class="room-rate">${rateStr(room.rate_low,room.rate_high)}</div>
      <button class="btn-select" data-id="${room.room_id}">${t('btn-pick')}</button>`;
      list.appendChild(row);
    });
    container.appendChild(list);
    list.addEventListener('click',e=>{
      const btn=e.target.closest('.btn-select');if(!btn)return;
      const room=rooms.find(r=>r.room_id===btn.dataset.id);
      if(!room)return;
      selectedRoom=room;
      list.querySelectorAll('.room-row').forEach(r=>r.classList.toggle('selected-row',r.dataset.id===room.room_id));
      const inp=document.getElementById('selected-room');inp.value=room.room_id;inp.classList.add('has-value');
      document.getElementById('book-section').scrollIntoView({behavior:'smooth',block:'start'});
    });
  }catch(err){showMsg('search-status','error',t('msg-connect-err',err.message));}
  finally{setBusy('search-btn',false);}
});

document.getElementById('book-btn')?.addEventListener('click',async()=>{
  const roomId=(document.getElementById('selected-room').value||'').trim();
  const payload=buildGuestPayload();
  if(!roomId)           {showMsg('book-status','warning',t('msg-no-room-sel'));return;}
  if(!payload.guest_name){showMsg('book-status','warning',t('msg-no-guest'));return;}
  if(!searchDates.check_in){showMsg('book-status','warning',t('msg-no-dates2'));return;}
  setBusy('book-btn',true);showMsg('book-status','loading',t('msg-booking'));
  document.getElementById('booking-result').classList.add('hidden');
  try{
    const{ok,status,data}=await callFn('create_booking',{
      room_id:roomId,
      check_in:searchDates.check_in,
      check_out:searchDates.check_out,
      source_channel:SOURCE_CHANNEL,
      channel:SOURCE_CHANNEL,
      ...payload,
    });
    if(status===409){showMsg('book-status','error',t('msg-conflict'));loadInventory();return;}
    if(!ok){showMsg('book-status','error',data.error||t('msg-book-err'));return;}
    const names=payload.guests.map(g=>g.guest_name).join(', ');
    showMsg('book-status','success',t('msg-book-ok'));
    const panel=document.getElementById('booking-result');
    panel.innerHTML=`<div class="bp-label">${t('bp-label')}</div>
      <div class="bp-code">${data.booking_id}</div>
      <div class="bp-detail">${roomId} &nbsp;·&nbsp; ${names} &nbsp;·&nbsp; ${searchDates.check_in} → ${searchDates.check_out}
        &nbsp;·&nbsp; <strong style="color:var(--gold)">StayAsia</strong></div>
      <button class="btn-copy" id="copy-bid-btn">${t('btn-copy')}</button>`;
    panel.classList.remove('hidden');
    document.getElementById('booking-id-input').value=data.booking_id;
    document.getElementById('copy-bid-btn').addEventListener('click',()=>{
      navigator.clipboard.writeText(data.booking_id)
        .then(()=>{const b=document.getElementById('copy-bid-btn');b.textContent=t('btn-copied');setTimeout(()=>{b.textContent=t('btn-copy');},2200);})
        .catch(()=>{prompt(t('copy-prompt'),data.booking_id);});
    });
    loadInventory();
  }catch(err){showMsg('book-status','error',t('msg-connect-err',err.message));}
  finally{setBusy('book-btn',false);}
});

// ── CANCEL (Kiểm tra đúng kênh StayAsia trước khi hủy) ────────
document.getElementById('cancel-btn')?.addEventListener('click',async()=>{
  const bookingId=(document.getElementById('booking-id-input').value||'').trim();
  if(!bookingId){showMsg('cancel-status','warning',t('msg-no-bid'));return;}
  
  setBusy('cancel-btn',true);showMsg('cancel-status','loading',t('msg-cancelling'));

  try{
    // 1. KIỂM TRA ĐƠN ĐẶT PHÒNG CÓ THUỘC KÊNH OTA_2 KHÔNG
    const bookings = await restGet('booking', `?booking_id=eq.${encodeURIComponent(bookingId)}&select=*`);
    if (!bookings || bookings.length === 0) {
      showMsg('cancel-status', 'error', t('msg-404'));
      return;
    }

    const b = bookings[0];
    let originalChannel = '';
    for (const [key, val] of Object.entries(b)) {
      if (/channel|source/i.test(key) && val) {
        originalChannel = String(val).toLowerCase().trim();
        break;
      }
    }

    // Nếu đơn thuộc kênh khác (ota_1 hoặc direct) -> Chặn ngay lập tức
    if (originalChannel && originalChannel !== SOURCE_CHANNEL && originalChannel !== 'stayasia') {
      showMsg('cancel-status', 'error', t('msg-wrong-channel'));
      return;
    }

    // 2. XÁC NHẬN VÀ TIẾN HÀNH HỦY
    if(!window.confirm(t('confirm-cancel',bookingId))) return;

    const{ok,status,data}=await callFn('cancel_booking',{
      booking_id:bookingId,
      source_channel:SOURCE_CHANNEL,
      channel:SOURCE_CHANNEL
    });

    if(status===404){showMsg('cancel-status','error',t('msg-404'));return;}
    if(status===400){showMsg('cancel-status','warning',data.error||t('msg-400'));return;}
    if(!ok){showMsg('cancel-status','error',data.error||t('msg-cancel-err'));return;}

    showMsg('cancel-status','success',t('msg-cancel-ok',bookingId));
    document.getElementById('booking-id-input').value='';
    loadInventory();
  }catch(err){
    showMsg('cancel-status','error',t('msg-connect-err',err.message));
  }finally{
    setBusy('cancel-btn',false);
  }
});

loadInventory();
setInterval(loadInventory,30000);
