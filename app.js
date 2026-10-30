/* ============================================================
   LỤA VÀNG RESORT & SPA — DIRECT BOOKING (app.js)
   Channel: direct | Hệ số chiết khấu: × 0.95 (-5%)
   ============================================================ */

const SUPABASE_URL   = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY       = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE        = `${SUPABASE_URL}/functions/v1`;
const REST_BASE      = `${SUPABASE_URL}/rest/v1`;
const SOURCE_CHANNEL = "direct";
const CHANNEL_MULT   = 0.95;

const ROOM_TYPE_MAP = {
  "Premier Garden View": "Deluxe Garden View",
  "Junior Suite Lagoon": "Suite Lagoon View",
  "Two-Bedroom Beachfront Villa": "Oceanfront Villa",
  "Deluxe Garden View": "Premier Garden View",
  "Suite Lagoon View": "Junior Suite Lagoon",
  "Oceanfront Villa": "Two-Bedroom Beachfront Villa"
};

let channelRatesCache = {};
let searchDates       = { check_in: null, check_out: null };
let selectedRoom      = null;

async function restGet(path, params = '') {
  const res = await fetch(`${REST_BASE}/${path}${params}`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
  });
  if (!res.ok) throw new Error(`REST ${res.status}`);
  return res.json();
}

async function callFn(name, body) {
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'apikey': ANON_KEY },
    body: JSON.stringify(body)
  });
  let data = {};
  try { data = await res.json(); } catch {}
  return { ok: res.ok, status: res.status, data };
}

function vnd(n) { return Number(n).toLocaleString('vi-VN') + ' ₫'; }

// NẠP TRỰC TIẾP GIÁ MỚI TỪ VIEW VÀ BẢNG ROOM_TYPES
async function fetchChannelRates() {
  channelRatesCache = {};
  try {
    // 1. Thử lấy từ v_channel_rates
    try {
      const rows = await restGet('v_channel_rates', `?or=(channel_code.eq.${SOURCE_CHANNEL},channel.eq.${SOURCE_CHANNEL})`);
      if (rows && rows.length > 0) {
        rows.forEach(r => {
          const key = String(r.room_type || '').toLowerCase().trim();
          const price = Number(r.channel_rate ?? r.computed_rate ?? r.rate ?? 0);
          if (price > 0) {
            channelRatesCache[key] = price;
            const alt = ROOM_TYPE_MAP[r.room_type];
            if (alt) channelRatesCache[alt.toLowerCase().trim()] = price;
          }
        });
      }
    } catch (_eView) {}

    // 2. Lấy Base Rate mới nhất từ bảng room_types để tính giá chuẩn
    try {
      const rtRows = await restGet('room_types', '?select=room_type,base_rate');
      if (rtRows && rtRows.length > 0) {
        rtRows.forEach(rt => {
          const key = String(rt.room_type || '').toLowerCase().trim();
          const basePrice = Number(rt.base_rate || 0);
          if (basePrice > 0) {
            const calculatedDirect = Math.round(basePrice * CHANNEL_MULT);
            channelRatesCache[key] = calculatedDirect;
            const alt = ROOM_TYPE_MAP[rt.room_type];
            if (alt) channelRatesCache[alt.toLowerCase().trim()] = calculatedDirect;
          }
        });
      }
    } catch (_eRt) {}

    // 3. Dự phòng lấy lần cập nhật gần nhất từ rate_history
    try {
      const histRows = await restGet('rate_history', '?order=changed_at.desc&limit=20');
      if (histRows && histRows.length > 0) {
        histRows.forEach(h => {
          const key = String(h.room_type || '').toLowerCase().trim();
          const basePrice = Number(h.new_base_rate || 0);
          if (basePrice > 0 && !channelRatesCache[key]) {
            const calculatedDirect = Math.round(basePrice * CHANNEL_MULT);
            channelRatesCache[key] = calculatedDirect;
            const alt = ROOM_TYPE_MAP[h.room_type];
            if (alt) channelRatesCache[alt.toLowerCase().trim()] = calculatedDirect;
          }
        });
      }
    } catch (_eHist) {}

  } catch (err) {
    console.warn("Lỗi đồng bộ giá Direct:", err.message);
  }
}

// BẮT BUỘC DÙNG GIÁ TÍNH TỪ BASE RATE MỚI NHẤT
function getDisplayRate(room) {
  const key = String(room.room_type || '').toLowerCase().trim();
  const altKey = (ROOM_TYPE_MAP[room.room_type] || '').toLowerCase().trim();

  if (channelRatesCache[key]) return `${vnd(channelRatesCache[key])}/đêm`;
  if (altKey && channelRatesCache[altKey]) return `${vnd(channelRatesCache[altKey])}/đêm`;

  const base = Number(room.rate_low || room.base_rate || 0);
  if (base > 0) return `${vnd(Math.round(base * CHANNEL_MULT))}/đêm`;
  return 'Liên hệ';
}

function showMsg(id, type, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `msg ${type}`;
  el.innerHTML = html;
}

function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = busy;
  if (busy) { btn.dataset.orig = btn.textContent; btn.textContent = 'Đang xử lý…'; }
  else { btn.textContent = btn.dataset.orig || btn.textContent; }
}

document.getElementById('search-btn')?.addEventListener('click', async () => {
  const ci = document.getElementById('check-in')?.value;
  const co = document.getElementById('check-out')?.value;
  if (!ci || !co) { showMsg('search-status', 'warning', 'Vui lòng chọn ngày nhận và trả phòng.'); return; }
  if (ci >= co) { showMsg('search-status', 'error', 'Ngày nhận phòng phải trước ngày trả phòng.'); return; }

  searchDates = { check_in: ci, check_out: co };
  selectedRoom = null;
  const selInput = document.getElementById('selected-room');
  if (selInput) { selInput.value = ''; selInput.classList.remove('has-value'); }
  document.getElementById('rooms-container').innerHTML = '';
  setBusy('search-btn', true);
  showMsg('search-status', 'loading', 'Đang kiểm tra phòng trống…');

  try {
    // Luôn tải lại bảng giá mới nhất mỗi lần bấm Search
    await fetchChannelRates();

    const { ok, data } = await callFn('check_availability', {
      check_in: ci, check_out: co, source_channel: SOURCE_CHANNEL
    });

    if (!ok) { showMsg('search-status', 'error', data.error || 'Không tìm thấy phòng.'); return; }
    const rooms = data.available_rooms || [];
    if (!rooms.length) { showMsg('search-status', 'warning', 'Không còn phòng trống trong khoảng thời gian này.'); return; }

    showMsg('search-status', 'success', `Tìm thấy <strong>${rooms.length}</strong> phòng sẵn sàng phục vụ.`);
    const container = document.getElementById('rooms-container');
    const list = document.createElement('div'); list.className = 'room-list';

    rooms.forEach(room => {
      const row = document.createElement('div'); row.className = 'room-row'; row.dataset.id = room.room_id;
      row.innerHTML = `
        <div class="room-info">
          <h4>${room.room_type} &mdash; <span style="font-family:var(--sans);font-size:.85rem">${room.room_id}</span></h4>
          <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} khách</div>
        </div>
        <div class="room-rate">${getDisplayRate(room)}</div>
        <button class="btn-select" data-id="${room.room_id}">Chọn phòng</button>`;
      list.appendChild(row);
    });

    container.appendChild(list);
    list.addEventListener('click', e => {
      const btn = e.target.closest('.btn-select');
      if (!btn) return;
      const room = rooms.find(r => r.room_id === btn.dataset.id);
      if (!room) return;
      selectedRoom = room;
      list.querySelectorAll('.room-row').forEach(r => r.classList.toggle('selected-row', r.dataset.id === room.room_id));
      if (selInput) { selInput.value = room.room_id; selInput.classList.add('has-value'); }
      document.getElementById('book-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } catch (err) {
    showMsg('search-status', 'error', `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy('search-btn', false);
  }
});

document.getElementById('book-btn')?.addEventListener('click', async () => {
  const roomId = (document.getElementById('selected-room')?.value || '').trim();
  const name   = (document.getElementById('guest-name')?.value   || '').trim();
  const email  = (document.getElementById('guest-email')?.value  || '').trim();
  const phone  = (document.getElementById('guest-phone')?.value  || '').trim();

  if (!roomId) { showMsg('book-status', 'warning', 'Vui lòng chọn phòng ở Bước 1.'); return; }
  if (!name)   { showMsg('book-status', 'warning', 'Vui lòng nhập tên khách lưu trú.'); return; }
  if (!searchDates.check_in) { showMsg('book-status', 'warning', 'Chưa có ngày lưu trú.'); return; }

  setBusy('book-btn', true);
  showMsg('book-status', 'loading', 'Đang tiến hành đặt phòng…');

  try {
    const { ok, status, data } = await callFn('create_booking', {
      room_id: roomId,
      check_in: searchDates.check_in,
      check_out: searchDates.check_out,
      source_channel: SOURCE_CHANNEL,
      guest_name: name,
      email: email || null,
      phone: phone || null,
      guests: [{ guest_name: name, email: email || null, phone: phone || null }]
    });

    if (status === 409) { showMsg('book-status', 'error', 'Phòng này vừa có khách đặt trùng ngày.'); return; }
    if (!ok) { showMsg('book-status', 'error', data.error || 'Đặt phòng không thành công.'); return; }

    showMsg('book-status', 'success', 'Đặt phòng thành công!');
    const panel = document.getElementById('booking-result');
    if (panel) {
      panel.innerHTML = `
        <div class="bp-label">Mã đặt phòng của quý khách:</div>
        <div class="bp-code">${data.booking_id}</div>
        <div class="bp-detail">${roomId} · ${name} · ${searchDates.check_in} → ${searchDates.check_out}</div>`;
      panel.classList.remove('hidden');
    }
  } catch (err) {
    showMsg('book-status', 'error', `Lỗi: ${err.message}`);
  } finally {
    setBusy('book-btn', false);
  }
});

document.getElementById('cancel-btn')?.addEventListener('click', async () => {
  const bid = (document.getElementById('booking-id-input')?.value || '').trim();
  if (!bid) { showMsg('cancel-status', 'warning', 'Vui lòng nhập mã đặt phòng.'); return; }
  if (!confirm(`Xác nhận hủy đơn đặt phòng: ${bid}?`)) return;

  setBusy('cancel-btn', true);
  showMsg('cancel-status', 'loading', 'Đang xử lý hủy phòng…');

  try {
    const { ok, data } = await callFn('cancel_booking', {
      booking_id: bid, source_channel: SOURCE_CHANNEL
    });
    if (!ok) { showMsg('cancel-status', 'error', data.error || 'Không thể hủy đơn này.'); return; }
    showMsg('cancel-status', 'success', `Đã hủy thành công đơn đặt phòng ${bid}.`);
    document.getElementById('booking-id-input').value = '';
  } catch (err) {
    showMsg('cancel-status', 'error', `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy('cancel-btn', false);
  }
});

fetchChannelRates();
