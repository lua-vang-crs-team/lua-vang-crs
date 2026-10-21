/* ============================================================
   LỤA VÀNG RESORT & SPA — BOOKING FRONTEND
   app.js — Search → Book → Cancel
   ============================================================ */

// ── CONFIG ───────────────────────────────────────────────────
// Supabase project: scxjezoysmwyumyebuls
const SUPABASE_URL = "https://scxjezoysmwyumyebuls.supabase.co";
const ANON_KEY     = "sb_publishable_rXMZpqv_C-N3ojDXI5xNKA_3L_0oD8w";
const FN_BASE      = `${SUPABASE_URL}/functions/v1`;

// ── STATE ────────────────────────────────────────────────────
let searchDates  = { check_in: null, check_out: null };
let selectedRoom = null;   // full room object chosen by user

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

/** Disable a button and show "Đang xử lý…" while waiting. */
function setBusy(btnId, busy) {
  const btn = document.getElementById(btnId);
  btn.disabled = busy;
  if (busy) {
    btn.dataset.orig = btn.textContent;
    btn.textContent  = "Đang xử lý…";
  } else {
    btn.textContent = btn.dataset.orig || btn.textContent;
  }
}

// ── FORMATTING ───────────────────────────────────────────────

function vnd(n) {
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

function rateStr(low, high) {
  if (low && high && String(low) !== String(high))
    return `${vnd(low)} – ${vnd(high)}/đêm`;
  if (low)  return `${vnd(low)}/đêm`;
  return "Liên hệ";
}

const ROOM_TYPE_MAP = {
  deluxe: "Deluxe", superior: "Superior", suite: "Suite",
  family: "Family", villa: "Villa", standard: "Standard",
};
function roomTypeName(t) {
  return ROOM_TYPE_MAP[(t || "").toLowerCase()] || (t || "Phòng");
}

// ── DATE INITIALISATION ──────────────────────────────────────

(function initDates() {
  const today = new Date().toISOString().split("T")[0];
  const ciEl  = document.getElementById("check-in");
  const coEl  = document.getElementById("check-out");

  ciEl.min = today;
  coEl.min = today;

  ciEl.addEventListener("change", () => {
    coEl.min = ciEl.value;
    if (coEl.value && coEl.value <= ciEl.value) coEl.value = "";
  });
})();

// ══════════════════════════════════════════════════════════════
//  SECTION 1 — SEARCH (check_availability)
// ══════════════════════════════════════════════════════════════

document.getElementById("search-btn").addEventListener("click", async () => {
  const checkIn  = document.getElementById("check-in").value;
  const checkOut = document.getElementById("check-out").value;

  // — Validate inputs
  if (!checkIn || !checkOut) {
    showMsg("search-status", "warning", "Vui lòng chọn cả ngày nhận và trả phòng.");
    return;
  }
  if (checkIn >= checkOut) {
    showMsg("search-status", "error", "Ngày nhận phòng phải trước ngày trả phòng.");
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
  showMsg("search-status", "loading", "Đang kiểm tra phòng trống…");

  try {
    const { ok, data } = await callFn("check_availability", {
      check_in:  checkIn,
      check_out: checkOut,
    });

    if (!ok) {
      showMsg("search-status", "error",
        data.error || "Không thể kết nối backend. Thử lại sau.");
      return;
    }

    const rooms = data.available_rooms || [];

    if (rooms.length === 0) {
      showMsg("search-status", "warning",
        "Không có phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.");
      return;
    }

    // — Đếm số hạng phòng (không đếm số phòng vật lý)
    const typeCount = new Set(rooms.map(r => (r.room_type || "").toLowerCase())).size;
    showMsg("search-status", "success",
      `Có <strong>${typeCount}</strong> hạng phòng trống trong khoảng thời gian này.`);
    renderRooms(rooms);

  } catch (err) {
    showMsg("search-status", "error", `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy("search-btn", false);
  }
});

/** Render available room types (grouped — không hiện số phòng, không hiện room_id). */
function renderRooms(rooms) {
  const container = document.getElementById("rooms-container");
  container.innerHTML = "";

  // ── Group by room_type ───────────────────────────────────────
  const groups = {};
  rooms.forEach((room) => {
    const key = (room.room_type || "other").toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(room);
  });

  const list = document.createElement("div");
  list.className = "room-list";

  Object.entries(groups).forEach(([type, typeRooms]) => {
    // Rate range across all physical rooms of this type
    const rates   = typeRooms.flatMap(r => [r.rate_low, r.rate_high]).filter(Boolean);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    // Capacity — lấy từ phòng đầu tiên trong nhóm
    const capacity = typeRooms[0].capacity;

    const card = document.createElement("div");
    card.className    = "room-row";
    card.dataset.type = type;

    card.innerHTML = `
      <div class="room-info">
        <h4>${roomTypeName(type)}</h4>
        <div class="room-meta">${capacity} người tối đa</div>
      </div>
      <div class="room-rate">${rateStr(minRate, maxRate)}</div>
      <button class="btn-select" data-type="${type}">Chọn</button>
    `;

    list.appendChild(card);
  });

  container.appendChild(list);

  // Single event listener (event delegation)
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-select");
    if (!btn) return;
    const type      = btn.dataset.type;
    const typeRooms = groups[type];
    if (typeRooms && typeRooms.length > 0) {
      pickRoom(typeRooms[0], list, type);
    }
  });
}

/** Handle room type selection — lưu phòng vật lý đầu tiên vào state, hiện tên hạng cho khách. */
function pickRoom(room, listEl, displayType) {
  selectedRoom = room;   // full room object (room_id dùng cho API call)

  // Highlight selected card
  const typeKey = displayType || (room.room_type || "").toLowerCase();
  listEl.querySelectorAll(".room-row").forEach((r) => {
    r.classList.toggle("selected-row", r.dataset.type === typeKey);
  });

  // Hiện TÊN HẠNG PHÒNG trong ô input (không hiện room_id)
  const input = document.getElementById("selected-room");
  input.value = roomTypeName(typeKey);
  input.classList.add("has-value");

  // Scroll xuống phần đặt phòng
  document.getElementById("book-section")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 2 — BOOK (create_booking)
// ══════════════════════════════════════════════════════════════

document.getElementById("book-btn").addEventListener("click", async () => {
  const guestName = (document.getElementById("guest-name").value || "").trim();

  // — Validate
  if (!selectedRoom) {
    showMsg("book-status", "warning",
      "Chưa chọn hạng phòng. Tìm phòng ở bước 1 và nhấn &laquo;Chọn&raquo;.");
    return;
  }
  const roomId = selectedRoom.room_id;   // room_id thật từ state, không từ ô hiển thị
  if (!guestName) {
    showMsg("book-status", "warning", "Vui lòng nhập tên khách lưu trú.");
    return;
  }
  if (!searchDates.check_in || !searchDates.check_out) {
    showMsg("book-status", "warning",
      "Chưa có ngày lưu trú. Quay lại bước 1 để tìm phòng.");
    return;
  }

  // — Call API
  setBusy("book-btn", true);
  showMsg("book-status", "loading", "Đang tạo đặt phòng…");
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
      showMsg("book-status", "error",
        "Phòng này vừa có người đặt trùng ngày. Vui lòng chọn hạng phòng khác.");
      return;
    }

    if (!ok) {
      showMsg("book-status", "error",
        data.error || "Không thể tạo booking. Thử lại sau.");
      return;
    }

    // Success
    showMsg("book-status", "success", "Đặt phòng thành công. Lưu lại mã bên dưới.");
    renderBookingPanel(data.booking_id, selectedRoom, guestName,
      searchDates.check_in, searchDates.check_out);

    // Auto-fill phần hủy
    document.getElementById("booking-id-input").value = data.booking_id;

  } catch (err) {
    showMsg("book-status", "error", `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy("book-btn", false);
  }
});

/** Render booking confirmation panel — hiện tên hạng phòng, không hiện room_id. */
function renderBookingPanel(bookingId, room, guestName, checkIn, checkOut) {
  const panel  = document.getElementById("booking-result");
  const copyId = "copy-bid-btn";

  panel.innerHTML = `
    <div class="bp-label">Mã đặt phòng — lưu lại để dùng khi cần hủy</div>
    <div class="bp-code">${bookingId}</div>
    <div class="bp-detail">
      ${roomTypeName(room.room_type)} &nbsp;·&nbsp; ${guestName} &nbsp;·&nbsp; ${checkIn} → ${checkOut}
    </div>
    <button class="btn-copy" id="${copyId}">Sao chép mã</button>
  `;

  panel.classList.remove("hidden");

  document.getElementById(copyId).addEventListener("click", () => {
    navigator.clipboard.writeText(bookingId)
      .then(() => {
        const btn = document.getElementById(copyId);
        btn.textContent = "Đã sao chép ✓";
        setTimeout(() => { btn.textContent = "Sao chép mã"; }, 2200);
      })
      .catch(() => {
        prompt("Sao chép mã booking:", bookingId);
      });
  });
}

// ══════════════════════════════════════════════════════════════
//  SECTION 3 — CANCEL (cancel_booking)
// ══════════════════════════════════════════════════════════════

document.getElementById("cancel-btn").addEventListener("click", async () => {
  const bookingId = (document.getElementById("booking-id-input").value || "").trim();

  if (!bookingId) {
    showMsg("cancel-status", "warning", "Vui lòng nhập mã đặt phòng cần hủy.");
    return;
  }

  const confirmed = window.confirm(
    `Xác nhận hủy đặt phòng:\n\n${bookingId}\n\nHành động này không thể hoàn tác.`
  );
  if (!confirmed) return;

  setBusy("cancel-btn", true);
  showMsg("cancel-status", "loading", "Đang xử lý hủy đặt phòng…");

  try {
    const { ok, status, data } = await callFn("cancel_booking", {
      booking_id: bookingId,
    });

    if (status === 404) {
      showMsg("cancel-status", "error",
        "Không tìm thấy booking này. Kiểm tra lại mã đặt phòng.");
      return;
    }
    if (status === 400) {
      showMsg("cancel-status", "warning",
        data.error || "Booking này không ở trạng thái có thể hủy (đã hủy trước đó?).");
      return;
    }
    if (!ok) {
      showMsg("cancel-status", "error",
        data.error || "Không thể hủy booking. Thử lại sau.");
      return;
    }

    // Success
    showMsg("cancel-status", "success",
      `Đã hủy thành công booking <strong>${bookingId}</strong>.`);
    document.getElementById("booking-id-input").value = "";

  } catch (err) {
    showMsg("cancel-status", "error", `Lỗi kết nối: ${err.message}`);
  } finally {
    setBusy("cancel-btn", false);
  }
});
