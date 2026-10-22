/* ============================================================
   LỤA VÀNG RESORT & SPA — BOOKING FRONTEND
   app.js — Search → Book → Cancel  |  Vi / En bilingual
   ============================================================ */

// ── CONFIG ───────────────────────────────────────────────────
// Supabase project: scxjezoysmwyumyebuls
const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;

// ── I18N — ALL UI STRINGS ────────────────────────────────────
const I18N = {
  vi: {
    /* ── static UI labels ── */
    'hotel-sub':      'Resort &amp; Spa &ensp;·&ensp; Hệ thống đặt phòng',
    'step1-tag':      'Bước 1',
    'step1-h2':       'Tìm phòng trống',
    'label-checkin':  'Ngày nhận phòng',
    'label-checkout': 'Ngày trả phòng',
    'btn-search':     'Kiểm tra phòng trống',
    'step2-tag':      'Bước 2',
    'step2-h2':       'Xác nhận đặt phòng',
    'label-room':     'Mã phòng đã chọn',
    'ph-room':        'Chọn phòng từ kết quả bên trên',
    'label-guest':    'Tên khách lưu trú',
    'ph-guest':       'Họ và tên đầy đủ',
    'btn-book':       'Xác nhận đặt phòng',
    'cancel-tag':     'Hủy đặt phòng',
    'cancel-h2':      'Nhập mã để hủy',
    'label-bid':      'Mã đặt phòng (Booking ID)',
    'ph-bid':         'Dán mã đặt phòng vào đây…',
    'btn-cancel':     'Hủy đặt phòng',
    'footer-text':    'Lụa Vàng Resort & Spa · Hệ thống quản lý đặt phòng nội bộ · 2026',
    /* ── room list ── */
    'btn-pick':       'Chọn',
    'unit-guests':    'người',
    'unit-night':     'đêm',
    'contact':        'Liên hệ',
    'room-fallback':  'Phòng',
    /* ── status & action messages ── */
    'msg-processing':   'Đang xử lý…',
    'msg-no-dates':     'Vui lòng chọn cả ngày nhận và trả phòng.',
    'msg-date-order':   'Ngày nhận phòng phải trước ngày trả phòng.',
    'msg-searching':    'Đang kiểm tra phòng trống…',
    'msg-backend-err':  'Không thể kết nối backend. Thử lại sau.',
    'msg-no-rooms':     'Không có phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.',
    'msg-no-room-sel':  'Chưa chọn phòng. Tìm phòng ở bước 1 và nhấn «Chọn».',
    'msg-no-guest':     'Vui lòng nhập tên khách lưu trú.',
    'msg-no-dates2':    'Chưa có ngày lưu trú. Quay lại bước 1 để tìm phòng.',
    'msg-booking':      'Đang tạo đặt phòng…',
    'msg-conflict':     'Phòng này vừa có người đặt trùng ngày. Vui lòng chọn phòng khác.',
    'msg-booking-err':  'Không thể tạo booking. Thử lại sau.',
    'msg-book-success': 'Đặt phòng thành công. Lưu lại mã bên dưới.',
    'msg-no-bid':       'Vui lòng nhập mã đặt phòng cần hủy.',
    'msg-cancelling':   'Đang xử lý hủy đặt phòng…',
    'msg-404':          'Không tìm thấy booking này. Kiểm tra lại mã đặt phòng.',
    'msg-400':          'Booking này không ở trạng thái có thể hủy (đã hủy trước đó?).',
    'msg-cancel-err':   'Không thể hủy booking. Thử lại sau.',
    /* ── booking panel ── */
    'bp-label':         'Mã đặt phòng — lưu lại để dùng khi cần hủy',
    'btn-copy':         'Sao chép mã',
    'btn-copied':       'Đã sao chép ✓',
    'copy-prompt':      'Sao chép mã booking:',
    /* ── functions returning strings ── */
    'msg-found-rooms':  (n) => `Tìm thấy <strong>${n}</strong> phòng trống.`,
    'msg-connect-err':  (e) => `Lỗi kết nối: ${e}`,
    'msg-cancel-ok':    (id) => `Đã hủy thành công booking <strong>${id}</strong>.`,
    'confirm-cancel':   (id) => `Xác nhận hủy đặt phòng:\n\n${id}\n\nHành động này không thể hoàn tác.`,
  },

  en: {
    /* ── static UI labels ── */
    'hotel-sub':      'Resort &amp; Spa &ensp;·&ensp; Booking System',
    'step1-tag':      'Step 1',
    'step1-h2':       'Find Available Rooms',
    'label-checkin':  'Check-in Date',
    'label-checkout': 'Check-out Date',
    'btn-search':     'Check Availability',
    'step2-tag':      'Step 2',
    'step2-h2':       'Confirm Booking',
    'label-room':     'Selected Room',
    'ph-room':        'Select a room from the results above',
    'label-guest':    'Guest Name',
    'ph-guest':       'Full name',
    'btn-book':       'Confirm Booking',
    'cancel-tag':     'Cancel Booking',
    'cancel-h2':      'Enter Code to Cancel',
    'label-bid':      'Booking ID',
    'ph-bid':         'Paste your booking ID here…',
    'btn-cancel':     'Cancel Booking',
    'footer-text':    'Lua Vang Resort & Spa · Internal Booking Management System · 2026',
    /* ── room list ── */
    'btn-pick':       'Select',
    'unit-guests':    'guests',
    'unit-night':     'night',
    'contact':        'Contact us',
    'room-fallback':  'Room',
    /* ── status & action messages ── */
    'msg-processing':   'Processing…',
    'msg-no-dates':     'Please select both check-in and check-out dates.',
    'msg-date-order':   'Check-in date must be before check-out date.',
    'msg-searching':    'Checking availability…',
    'msg-backend-err':  'Unable to connect to the server. Please try again.',
    'msg-no-rooms':     'No rooms available for this period. Please try different dates.',
    'msg-no-room-sel':  'No room selected. Find a room in Step 1 and click "Select".',
    'msg-no-guest':     'Please enter the guest name.',
    'msg-no-dates2':    'No stay dates found. Please go back to Step 1.',
    'msg-booking':      'Creating your booking…',
    'msg-conflict':     'This room was just booked for the same dates. Please choose another room.',
    'msg-booking-err':  'Unable to create booking. Please try again.',
    'msg-book-success': 'Booking confirmed. Please save the ID below.',
    'msg-no-bid':       'Please enter the booking ID to cancel.',
    'msg-cancelling':   'Processing cancellation…',
    'msg-404':          'Booking not found. Please check the booking ID.',
    'msg-400':          'This booking cannot be cancelled (already cancelled?).',
    'msg-cancel-err':   'Unable to cancel booking. Please try again.',
    /* ── booking panel ── */
    'bp-label':         'Booking ID — save this to use when cancelling',
    'btn-copy':         'Copy ID',
    'btn-copied':       'Copied ✓',
    'copy-prompt':      'Copy your booking ID:',
    /* ── functions returning strings ── */
    'msg-found-rooms':  (n) => `Found <strong>${n}</strong> available room${n !== 1 ? 's' : ''}.`,
    'msg-connect-err':  (e) => `Connection error: ${e}`,
    'msg-cancel-ok':    (id) => `Booking <strong>${id}</strong> successfully cancelled.`,
    'confirm-cancel':   (id) => `Confirm booking cancellation:\n\n${id}\n\nThis action cannot be undone.`,
  },
};

// ── STATE ────────────────────────────────────────────────────
let searchDates  = { check_in: null, check_out: null };
let selectedRoom = null;   // room object chosen by user
let currentLang  = 'vi';   // active language

// ── TRANSLATE HELPER ─────────────────────────────────────────
/**
 * Look up a translation key in the current language.
 * Falls back to Vietnamese, then returns the key itself.
 * Pass additional args for function-type entries.
 */
function t(key, ...args) {
  const table = I18N[currentLang] || I18N.vi;
  const entry = (key in table) ? table[key]
              : (key in I18N.vi) ? I18N.vi[key]
              : key;
  return typeof entry === 'function' ? entry(...args) : entry;
}

// ── APPLY LANGUAGE ───────────────────────────────────────────
/**
 * Switch all UI text to the given language ('vi' or 'en').
 * Updates static elements via data-i18n* attributes,
 * then patches any dynamically rendered elements still in the DOM.
 */
function applyLanguage(lang) {
  currentLang = lang;

  // 1. Document-level attributes
  document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
  document.title = lang === 'en'
    ? 'Room Booking — Lua Vang Resort & Spa'
    : 'Đặt Phòng — Lụa Vàng Resort & Spa';

  // 2. Toggle button highlight
  document.querySelectorAll('.lang-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  // 3. Elements with textContent translation
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // 4. Elements with innerHTML translation (may contain HTML entities)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  // 5. Input placeholder translations
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // 6. Dynamically rendered "Select / Chọn" buttons in room list
  document.querySelectorAll('.btn-select').forEach(btn => {
    btn.textContent = t('btn-pick');
  });

  // 7. Booking panel label (if the panel is currently visible)
  const bpLabel = document.querySelector('.bp-label');
  if (bpLabel) bpLabel.textContent = t('bp-label');

  // 8. Copy-ID button (skip if it's showing the "Copied ✓" state)
  const copyBtn = document.getElementById('copy-bid-btn');
  if (copyBtn) {
    const isCopiedState = Object.values(I18N).some(
      table => copyBtn.textContent === table['btn-copied']
    );
    if (!isCopiedState) copyBtn.textContent = t('btn-copy');
  }

  // 9. Persist preference across sessions
  try { localStorage.setItem('booking-lang', lang); } catch { /* ignore */ }
}

// ── CORE API CALL ─────────────────────────────────────────────
/**
 * POST to a Supabase Edge Function.
 * @param {string} name  - function name (e.g. "check_availability")
 * @param {object} body  - JSON payload
 * @returns {{ ok: boolean, status: number, data: object }}
 */
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
  try { data = await res.json(); } catch { /* empty response */ }

  return { ok: res.ok, status: res.status, data };
}

// ── UI HELPERS ───────────────────────────────────────────────

/** Show a status message inside an element. */
function showMsg(id, type, html) {
  const el = document.getElementById(id);
  el.className = `msg ${type}`;
  el.innerHTML = html;
}

function hideMsg(id) {
  const el = document.getElementById(id);
  el.className = "msg hidden";
  el.innerHTML = "";
}

/** Disable a button and show a localised "processing" label. */
function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);
  btn.disabled = busy;
  if (busy) {
    btn.dataset.orig = btn.textContent;
    btn.textContent  = t('msg-processing');
  } else {
    btn.textContent = btn.dataset.orig || btn.textContent;
  }
}

// ── FORMATTING ───────────────────────────────────────────────

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

// ── DATE INITIALISATION ──────────────────────────────────────

(function initDates() {
  const today = new Date().toISOString().split("T")[0];
  const ciEl  = document.getElementById("check-in");
  const coEl  = document.getElementById("check-out");

  ciEl.min = today;
  coEl.min = today;

  ciEl.addEventListener("change", () => {
    // check-out must be at least 1 day after check-in
    coEl.min = ciEl.value;
    if (coEl.value && coEl.value <= ciEl.value) coEl.value = "";
  });
})();

// ── LANGUAGE TOGGLE INITIALISATION ──────────────────────────

(function initLang() {
  // Click handler on the toggle pill
  const toggle = document.getElementById("lang-toggle");
  if (toggle) {
    toggle.addEventListener("click", (e) => {
      const opt = e.target.closest(".lang-opt");
      if (!opt) return;
      const newLang = opt.dataset.lang;
      if (newLang && newLang !== currentLang) {
        applyLanguage(newLang);
      }
    });
  }

  // Restore any saved preference, then apply
  let initLangVal = 'vi';
  try {
    const saved = localStorage.getItem('booking-lang');
    if (saved === 'en' || saved === 'vi') initLangVal = saved;
  } catch { /* ignore */ }

  applyLanguage(initLangVal);
})();

// ══════════════════════════════════════════════════════════════
//  SECTION 1 — SEARCH (check_availability)
// ══════════════════════════════════════════════════════════════

document.getElementById("search-btn").addEventListener("click", async () => {
  const checkIn  = document.getElementById("check-in").value;
  const checkOut = document.getElementById("check-out").value;

  // — Validate inputs
  if (!checkIn || !checkOut) {
    showMsg("search-status", "warning", t('msg-no-dates'));
    return;
  }
  if (checkIn >= checkOut) {
    showMsg("search-status", "error", t('msg-date-order'));
    return;
  }

  // — Reset state
  searchDates  = { check_in: checkIn, check_out: checkOut };
  selectedRoom = null;
  const roomInput = document.getElementById("selected-room");
  roomInput.value = "";
  roomInput.classList.remove("has-value");
  document.getElementById("rooms-container").innerHTML = "";

  // — Call API
  setBusy("search-btn", true);
  showMsg("search-status", "loading", t('msg-searching'));

  try {
    const { ok, data } = await callFn("check_availability", {
      check_in:  checkIn,
      check_out: checkOut,
    });

    if (!ok) {
      showMsg("search-status", "error", data.error || t('msg-backend-err'));
      return;
    }

    const rooms = data.available_rooms || [];

    if (rooms.length === 0) {
      showMsg("search-status", "warning", t('msg-no-rooms'));
      return;
    }

    showMsg("search-status", "success", t('msg-found-rooms', rooms.length));
    renderRooms(rooms);

  } catch (err) {
    showMsg("search-status", "error", t('msg-connect-err', err.message));
  } finally {
    setBusy("search-btn", false);
  }
});

/** Render the list of available rooms. */
function renderRooms(rooms) {
  const container = document.getElementById("rooms-container");
  container.innerHTML = "";

  const list = document.createElement("div");
  list.className = "room-list";

  rooms.forEach((room) => {
    const row       = document.createElement("div");
    row.className   = "room-row";
    row.dataset.id  = room.room_id;

    row.innerHTML = `
      <div class="room-info">
        <h4>${roomTypeName(room.room_type)} &mdash; <span style="font-family:var(--sans);font-size:0.85rem">${room.room_id}</span></h4>
        <div class="room-meta">${room.size_sqm} m² &ensp;&middot;&ensp; ${room.capacity} ${t('unit-guests')}</div>
      </div>
      <div class="room-rate">${rateStr(room.rate_low, room.rate_high)}</div>
      <button class="btn-select" data-id="${room.room_id}">${t('btn-pick')}</button>
    `;

    list.appendChild(row);
  });

  container.appendChild(list);

  // Single event listener on the list (event delegation)
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-select");
    if (!btn) return;
    const room = rooms.find((r) => r.room_id === btn.dataset.id);
    if (room) pickRoom(room, list);
  });
}

/** Handle room selection. */
function pickRoom(room, listEl) {
  selectedRoom = room;

  // Highlight selected row
  listEl.querySelectorAll(".room-row").forEach((r) => {
    r.classList.toggle("selected-row", r.dataset.id === room.room_id);
  });

  // Fill room input
  const input = document.getElementById("selected-room");
  input.value = room.room_id;
  input.classList.add("has-value");

  // Scroll to booking section
  document.getElementById("book-section")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 2 — BOOK (create_booking)
// ══════════════════════════════════════════════════════════════

document.getElementById("book-btn").addEventListener("click", async () => {
  const roomId    = (document.getElementById("selected-room").value || "").trim();
  const guestName = (document.getElementById("guest-name").value   || "").trim();

  // — Validate
  if (!roomId) {
    showMsg("book-status", "warning", t('msg-no-room-sel'));
    return;
  }
  if (!guestName) {
    showMsg("book-status", "warning", t('msg-no-guest'));
    return;
  }
  if (!searchDates.check_in || !searchDates.check_out) {
    showMsg("book-status", "warning", t('msg-no-dates2'));
    return;
  }

  // — Call API
  setBusy("book-btn", true);
  showMsg("book-status", "loading", t('msg-booking'));
  document.getElementById("booking-result").classList.add("hidden");

  try {
    const { ok, status, data } = await callFn("create_booking", {
      room_id:    roomId,
      guest_name: guestName,
      check_in:   searchDates.check_in,
      check_out:  searchDates.check_out,
    });

    // HTTP 409 — conflict
    if (status === 409) {
      showMsg("book-status", "error", t('msg-conflict'));
      return;
    }

    if (!ok) {
      showMsg("book-status", "error", data.error || t('msg-booking-err'));
      return;
    }

    // Success
    showMsg("book-status", "success", t('msg-book-success'));
    renderBookingPanel(data.booking_id, roomId, guestName,
      searchDates.check_in, searchDates.check_out);

    // Auto-fill cancel section
    document.getElementById("booking-id-input").value = data.booking_id;

  } catch (err) {
    showMsg("book-status", "error", t('msg-connect-err', err.message));
  } finally {
    setBusy("book-btn", false);
  }
});

/** Render the booking confirmation panel with booking ID. */
function renderBookingPanel(bookingId, roomId, guestName, checkIn, checkOut) {
  const panel  = document.getElementById("booking-result");
  const copyId = "copy-bid-btn";

  panel.innerHTML = `
    <div class="bp-label">${t('bp-label')}</div>
    <div class="bp-code">${bookingId}</div>
    <div class="bp-detail">
      ${roomId} &nbsp;·&nbsp; ${guestName} &nbsp;·&nbsp; ${checkIn} → ${checkOut}
    </div>
    <button class="btn-copy" id="${copyId}">${t('btn-copy')}</button>
  `;

  panel.classList.remove("hidden");

  document.getElementById(copyId).addEventListener("click", () => {
    navigator.clipboard.writeText(bookingId)
      .then(() => {
        const btn = document.getElementById(copyId);
        btn.textContent = t('btn-copied');
        setTimeout(() => { btn.textContent = t('btn-copy'); }, 2200);
      })
      .catch(() => {
        // Fallback for browsers that block clipboard API
        prompt(t('copy-prompt'), bookingId);
      });
  });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 3 — CANCEL (cancel_booking)
// ══════════════════════════════════════════════════════════════

document.getElementById("cancel-btn").addEventListener("click", async () => {
  const bookingId = (document.getElementById("booking-id-input").value || "").trim();

  if (!bookingId) {
    showMsg("cancel-status", "warning", t('msg-no-bid'));
    return;
  }

  const confirmed = window.confirm(t('confirm-cancel', bookingId));
  if (!confirmed) return;

  setBusy("cancel-btn", true);
  showMsg("cancel-status", "loading", t('msg-cancelling'));

  try {
    const { ok, status, data } = await callFn("cancel_booking", {
      booking_id: bookingId,
    });

    if (status === 404) {
      showMsg("cancel-status", "error", t('msg-404'));
      return;
    }
    if (status === 400) {
      showMsg("cancel-status", "warning", data.error || t('msg-400'));
      return;
    }
    if (!ok) {
      showMsg("cancel-status", "error", data.error || t('msg-cancel-err'));
      return;
    }

    // Success
    showMsg("cancel-status", "success", t('msg-cancel-ok', bookingId));
    document.getElementById("booking-id-input").value = "";

  } catch (err) {
    showMsg("cancel-status", "error", t('msg-connect-err', err.message));
  } finally {
    setBusy("cancel-btn", false);
  }
});
